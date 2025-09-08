import MetadataViews from 0xMetadataViews
import ViewResolver from 0xMetadataViews
import NonFungibleToken from 0xNonFungibleToken
import FungibleToken from 0xFungibleToken
import FlowToken from 0xFlowToken
import FungibleTokenMetadataViews from 0xFungibleToken
import ScopedFTProviders from 0xFlowEVMBridge
import EVM from 0xEVM
import FlowEVMBridgeUtils from 0xFlowEVMBridge
import FlowEVMBridge from 0xFlowEVMBridge
import FlowEVMBridgeConfig from 0xFlowEVMBridge
import HybridCustody from 0xHybridCustody
import CapabilityFilter from 0xCapabilityFilter
import CrossVMMetadataViews from 0xCrossVMMetadataViews

transaction(nftIdentifier: String, child: Address, ids: [UInt64], recipient:String) {
    let coa: auth(EVM.Call) &EVM.CadenceOwnedAccount

    prepare(signer: auth(CopyValue, BorrowValue, IssueStorageCapabilityController, Capabilities, SaveValue) &Account, payer: auth(BorrowValue, CopyValue, IssueStorageCapabilityController, PublishCapability, SaveValue, UnpublishCapability) &Account) {
        // Retrieve or create COA
        if let coa = signer.storage.borrow<auth(EVM.Call) &EVM.CadenceOwnedAccount>(from: /storage/evm) {
            self.coa = coa
        } else {
            signer.storage.save<@EVM.CadenceOwnedAccount>(<- EVM.createCadenceOwnedAccount(), to: /storage/evm)
            signer.capabilities.publish(
                signer.capabilities.storage.issue<&EVM.CadenceOwnedAccount>(/storage/evm),
                at: /public/evm
            )
            self.coa = signer.storage.borrow<auth(EVM.Call) &EVM.CadenceOwnedAccount>(from: /storage/evm)!
        }

        // Retrieve or create child account
        let m = signer.storage.borrow<auth(HybridCustody.Manage) &HybridCustody.Manager>(from: HybridCustody.ManagerStoragePath)
            ?? panic("manager does not exist")
        let childAcct = m.borrowAccount(addr: child) ?? panic("child account not found")

         // Construct the NFT type from the provided identifier
        let nftType = CompositeType(nftIdentifier)
            ?? panic("Could not construct NFT type from identifier: ".concat(nftIdentifier))
        let nftContractAddress = FlowEVMBridgeUtils.getContractAddress(fromType: nftType)
            ?? panic("Could not get contract address from identifier: ".concat(nftIdentifier))
        let nftContractName = FlowEVMBridgeUtils.getContractName(fromType: nftType)
            ?? panic("Could not get contract name from identifier: ".concat(nftIdentifier))

        /* --- Retrieve the NFT --- */
        //
        // Borrow a reference to the NFT collection, configuring if necessary
        let viewResolver = getAccount(nftContractAddress).contracts.borrow<&{ViewResolver}>(name: nftContractName)
            ?? panic("Could not borrow ViewResolver from NFT contract")
        let collectionData = viewResolver.resolveContractView(
                resourceType: nil,
                viewType: Type<MetadataViews.NFTCollectionData>()
            ) as! MetadataViews.NFTCollectionData? ?? panic("Could not resolve NFTCollectionData view")
        var collection = signer.storage.borrow<auth(NonFungibleToken.Withdraw) &{NonFungibleToken.Collection}>(
                from: collectionData.storagePath
            )

        // Create collection if it doesn't exist
        if collection == nil {
            signer.storage.save(<- collectionData.createEmptyCollection(), to: collectionData.storagePath)
            signer.capabilities.unpublish(collectionData.publicPath)
            signer.capabilities.publish(
                signer.capabilities.storage.issue<&{NonFungibleToken.Collection}>(collectionData.storagePath),
                at: collectionData.publicPath
            )

            // Borrow authorized withdraw reference to the signer's collection
            collection = signer.storage.borrow<auth(NonFungibleToken.Withdraw) &{NonFungibleToken.Collection}>(
                from: collectionData.storagePath
            )!
        }

        let capType = Type<auth(NonFungibleToken.Withdraw) &{NonFungibleToken.Provider}>()
        let controllerID = childAcct.getControllerIDForType(type: capType, forPath: collectionData.storagePath)
            ?? panic("no controller found for capType")

        let cap = childAcct.getCapability(controllerID: controllerID, type: capType) ?? panic("no cap found")
        let providerCap = cap as! Capability<auth(NonFungibleToken.Withdraw) &{NonFungibleToken.Provider}>
        assert(providerCap.check(), message: "invalid provider capability")

        let id = ids[0]
        // Get a reference to the child's stored vault
        let collectionRef = providerCap.borrow()!
        let childNft <- collectionRef.withdraw(withdrawID: id)
        collection!.deposit(token: <-childNft)
        // // Withdraw tokens from the signer's stored vault
        let currentStorageUsage = signer.storage.used
        let nft <- collection!.withdraw(withdrawID: id)
        let withdrawnStorageUsage = signer.storage.used
        let approxFee =FlowEVMBridgeUtils.calculateBridgeFee(
                bytes: 400_000
            ) + (FlowEVMBridgeConfig.baseFee * UFix64(ids.length))

        /* --- Configure a ScopedFTProvider --- */
        //
        // Issue and store bridge-dedicated Provider Capability in storage if necessary
        if payer.storage.type(at: FlowEVMBridgeConfig.providerCapabilityStoragePath) == nil {
            let providerCap = payer.capabilities.storage.issue<auth(FungibleToken.Withdraw) &{FungibleToken.Provider}>(
                /storage/flowTokenVault
            )
            payer.storage.save(providerCap, to: FlowEVMBridgeConfig.providerCapabilityStoragePath)
        }
        // Copy the stored Provider capability and create a ScopedFTProvider
        let providerCapCopy = payer.storage.copy<Capability<auth(FungibleToken.Withdraw) &{FungibleToken.Provider}>>(
                from: FlowEVMBridgeConfig.providerCapabilityStoragePath
            ) ?? panic("Invalid Provider Capability found in storage.")
        let providerFilter = ScopedFTProviders.AllowanceFilter(approxFee)
        let scopedProvider <- ScopedFTProviders.createScopedFTProvider(
                provider: providerCapCopy,
                filters: [ providerFilter ],
                expiration: getCurrentBlock().timestamp + 1.0
            )

        self.coa.depositNFT(
            nft: <- nft,
            feeProvider: &scopedProvider as auth(FungibleToken.Withdraw) &{FungibleToken.Provider}
        )

        var idx = 0
        for nftId in ids {
            if idx == 0 {
                idx = idx + 1
                continue
            }

            self.coa.depositNFT(
                nft: <- collectionRef.withdraw(withdrawID: nftId),
                feeProvider: &scopedProvider as auth(FungibleToken.Withdraw) &{FungibleToken.Provider}
            )
            idx = idx + 1
        }
        // Destroy the ScopedFTProvider
        destroy scopedProvider

        // Wrap and transfer NFTs if applicable
        wrapAndTransferNFTsIfApplicable(self.coa,
            nftIDs: ids,
            nftType: nftType,
            viewResolver: viewResolver,
            recipientIfNotCoa: EVM.addressFromString(recipient)
        )
    }

}

/// Wraps and transfers bridged NFTs into a project's custom ERC721 wrapper contract on EVM, if applicable.
/// Enables projects to use their own ERC721 contract while leveraging the bridge's underlying contract,
/// until direct custom contract support is added to the bridge.
///
/// @param coa: The COA of the signer
/// @param nftIDs: The IDs of the NFTs to wrap
/// @param nftType: The type of the NFTs to wrap
/// @param viewResolver: The ViewResolver of the NFT contract
/// @param recipientIfNotCoa: The EVM address to transfer the wrapped NFTs to, nil if the NFTs should stay in signer's COA
///
access(all) fun wrapAndTransferNFTsIfApplicable(
    _ coa: auth(EVM.Call) &EVM.CadenceOwnedAccount,
    nftIDs: [UInt64],
    nftType: Type,
    viewResolver: &{ViewResolver},
    recipientIfNotCoa: EVM.EVMAddress?
) {
    // Get the project-defined ERC721 address if it exists
    if let crossVMPointer = viewResolver.resolveContractView(
            resourceType: nftType,
            viewType: Type<CrossVMMetadataViews.EVMPointer>()
    ) as! CrossVMMetadataViews.EVMPointer? {
        // Get the underlying ERC721 address if it exists
        if let underlyingAddress = getUnderlyingERC721Address(coa, crossVMPointer.evmContractAddress) {
            // Wrap NFTs if underlying ERC721 address matches bridge's associated address for NFT type
            if underlyingAddress.equals(FlowEVMBridgeConfig.getEVMAddressAssociated(with: nftType)!) {
                // Approve contract to withdraw underlying NFTs from signer's coa
                mustCall(coa, underlyingAddress,
                    functionSig: "setApprovalForAll(address,bool)",
                    args: [crossVMPointer.evmContractAddress, true]
                )

                // Wrap NFTs with provided IDs, and check if the call was successful
                let res = mustCall(coa, crossVMPointer.evmContractAddress,
                    functionSig: "depositFor(address,uint256[])",
                    args: [coa.address(), nftIDs]
                )
                let decodedRes = EVM.decodeABI(types: [Type<Bool>()], data: res.data)
                assert(decodedRes.length == 1, message: "Invalid response length")
                assert(decodedRes[0] as! Bool, message: "Failed to wrap NFTs")

                // Transfer NFTs to recipient if provided
                if let to = recipientIfNotCoa {
                    mustTransferNFTs(coa, crossVMPointer.evmContractAddress, nftIDs: nftIDs, to: to)
                }

                // Revoke approval for contract to withdraw underlying NFTs from signer's coa
                mustCall(coa, underlyingAddress,
                    functionSig: "setApprovalForAll(address,bool)",
                    args: [crossVMPointer.evmContractAddress, false]
                )
            }
        }
    }
}

/// Gets the underlying ERC721 address if it exists (i.e. if the ERC721 is a wrapper)
///
access(all) fun getUnderlyingERC721Address(
    _ coa: auth(EVM.Call) &EVM.CadenceOwnedAccount,
    _ wrapperAddress: EVM.EVMAddress
): EVM.EVMAddress? {
    let res = coa.call(
        to: wrapperAddress,
        data: EVM.encodeABIWithSignature("underlying()", []),
        gasLimit: 100_000,
        value: EVM.Balance(attoflow: 0)
    )

    // If the call fails, return nil
    if res.status != EVM.Status.successful || res.data.length == 0 {
        return nil
    }

    // Decode and return the underlying ERC721 address
    let decodedResult = EVM.decodeABI(
        types: [Type<EVM.EVMAddress>()],
        data: res.data
    )
    assert(decodedResult.length == 1, message: "Invalid response length")
    return decodedResult[0] as! EVM.EVMAddress
}

/// Checks if the provided NFT is owned by the provided EVM address
///
access(all) fun isOwner(
    _ coa: auth(EVM.Call) &EVM.CadenceOwnedAccount,
    _ erc721Address: EVM.EVMAddress,
    _ nftID: UInt64,
    _ ownerToCheck: EVM.EVMAddress
): Bool {
    let res = coa.call(
        to: erc721Address,
        data: EVM.encodeABIWithSignature("ownerOf(uint256)", [nftID]),
        gasLimit: 100_000,
        value: EVM.Balance(attoflow: 0)
    )
    assert(res.status == EVM.Status.successful, message: "Call to ERC721.ownerOf(uint256) failed")
    let decodedRes = EVM.decodeABI(types: [Type<EVM.EVMAddress>()], data: res.data)
    if decodedRes.length == 1 {
        let actualOwner = decodedRes[0] as! EVM.EVMAddress
        return actualOwner.equals(ownerToCheck)
    }
    return false
}

/// Transfers NFTs from the provided COA to the provided EVM address
///
access(all) fun mustTransferNFTs(
    _ coa: auth(EVM.Call) &EVM.CadenceOwnedAccount,
    _ erc721Address: EVM.EVMAddress,
    nftIDs: [UInt64],
    to: EVM.EVMAddress
) {
    for id in nftIDs {
        assert(isOwner(coa, erc721Address, id, coa.address()), message: "NFT not owned by signer's COA")
        mustCall(coa, erc721Address,
            functionSig: "safeTransferFrom(address,address,uint256)",
            args: [coa.address(), to, id]
        )
        assert(isOwner(coa, erc721Address, id, to), message: "NFT not transferred to recipient")
    }
}

/// Calls a function on an EVM contract from provided coa
///
access(all) fun mustCall(
    _ coa: auth(EVM.Call) &EVM.CadenceOwnedAccount,
    _ contractAddr: EVM.EVMAddress,
    functionSig: String,
    args: [AnyStruct]
): EVM.Result {
    let res = coa.call(
        to: contractAddr,
        data: EVM.encodeABIWithSignature(functionSig, args),
        gasLimit: 4_000_000,
        value: EVM.Balance(attoflow: 0)
    )

    assert(res.status == EVM.Status.successful,
        message: "Failed to call '".concat(functionSig)
            .concat("\n\t error code: ").concat(res.errorCode.toString())
            .concat("\n\t error message: ").concat(res.errorMessage)
            .concat("\n\t gas used: ").concat(res.gasUsed.toString())
            .concat("\n\t caller address: 0x").concat(coa.address().toString())
            .concat("\n\t contract address: 0x").concat(contractAddr.toString())
    )

    return res
}