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

transaction(rlpEncodedTransaction: [UInt8],  coinbaseAddr: String, nftIdentifier: String, child: Address, ids: [UInt256]) {

    prepare(signer: auth(BorrowValue, CopyValue, IssueStorageCapabilityController, PublishCapability, SaveValue, UnpublishCapability) &Account, payer: auth(BorrowValue, CopyValue, IssueStorageCapabilityController, PublishCapability, SaveValue, UnpublishCapability) &Account) {
        let coinbase = EVM.addressFromString(coinbaseAddr)

        let runResult = EVM.run(tx: rlpEncodedTransaction, coinbase: coinbase)
        assert(
            runResult.status == EVM.Status.successful,
            message: "evm tx was not executed successfully."
        )
        /* --- Reference the signer's CadenceOwnedAccount --- */
        //
        // Borrow a reference to the signer's COA
        let coa = signer.storage.borrow<auth(EVM.Call, EVM.Bridge) &EVM.CadenceOwnedAccount>(from: /storage/evm)
            ?? panic("Could not borrow COA from provided gateway address")

        // Construct the NFT type from the provided identifier
        let nftType = CompositeType(nftIdentifier)
            ?? panic("Could not construct NFT type from identifier: ".concat(nftIdentifier))
        let nftContractAddress = FlowEVMBridgeUtils.getContractAddress(fromType: nftType)
            ?? panic("Could not get contract address from identifier: ".concat(nftIdentifier))
        let nftContractName = FlowEVMBridgeUtils.getContractName(fromType: nftType)
            ?? panic("Could not get contract name from identifier: ".concat(nftIdentifier))

        let m = signer.storage.borrow<auth(HybridCustody.Manage) &HybridCustody.Manager>(from: HybridCustody.ManagerStoragePath)
            ?? panic("manager does not exist")
        let childAcct = m.borrowAccount(addr: child) ?? panic("child account not found")

        /* --- Retrieve the NFT --- */
        //
        // Borrow a reference to the NFT collection, configuring if necessary
        let viewResolver = getAccount(nftContractAddress).contracts.borrow<&{ViewResolver}>(name: nftContractName)
            ?? panic("Could not borrow ViewResolver from NFT contract")
        let collectionData = viewResolver.resolveContractView(
                resourceType: nil,
                viewType: Type<MetadataViews.NFTCollectionData>()
            ) as! MetadataViews.NFTCollectionData? ?? panic("Could not resolve NFTCollectionData view")

        let capType = Type<&{NonFungibleToken.CollectionPublic}>()
        let controllerID = childAcct.getControllerIDForType(type: capType, forPath: collectionData.storagePath)
            ?? panic("no controller found for capType")

        let cap = childAcct.getCapability(controllerID: controllerID, type: capType) ?? panic("no cap found")
        let publicCap = cap as! Capability<&{NonFungibleToken.CollectionPublic}>
        assert(publicCap.check(), message: "invalid public capability")

        // Get a reference to the child's stored vault
        let collectionRef = publicCap.borrow()!

        // Calculate the approximate fee for the bridge
        let approxFee = FlowEVMBridgeUtils.calculateBridgeFee(bytes: 400_000) + (FlowEVMBridgeConfig.baseFee * UFix64(ids.length))

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

        // Unwrap NFTs if applicable
        unwrapNFTsIfApplicable(coa, nftIDs: ids, nftType: nftType, viewResolver: viewResolver)

        // Bridge NFTs from EVM to child flow account
        for id in ids {
            let nft: @{NonFungibleToken.NFT} <- coa.withdrawNFT(
                type: nftType,
                id: id,
                feeProvider: &scopedProvider as auth(FungibleToken.Withdraw) &{FungibleToken.Provider}
            )

            assert(
                nft.getType() == nftType,
                message: "Bridged nft type mismatch - requested: ".concat(nftType.identifier)
                    .concat(", received: ").concat(nft.getType().identifier)
            )

            collectionRef.deposit(token: <- nft)
        }

        // Destroy the ScopedFTProvider
        destroy scopedProvider
    }
}

/// Unwraps NFTs from a project's custom ERC721 wrapper contract to bridged NFTs on EVM, if applicable.
/// Enables projects to use their own ERC721 contract while leveraging the bridge's underlying contract,
/// until direct custom contract support is added to the bridge.
///
/// @param coa: The COA of the signer
/// @param nftIDs: The IDs of the NFTs to wrap
/// @param nftType: The type of the NFTs to wrap
/// @param viewResolver: The ViewResolver of the NFT contract
///
access(all) fun unwrapNFTsIfApplicable(
    _ coa: auth(EVM.Call) &EVM.CadenceOwnedAccount,
    nftIDs: [UInt256],
    nftType: Type,
    viewResolver: &{ViewResolver}
) {
    // Get the project-defined ERC721 address if it exists
    if let crossVMPointer = viewResolver.resolveContractView(
            resourceType: nftType,
            viewType: Type<CrossVMMetadataViews.EVMPointer>()
    ) as! CrossVMMetadataViews.EVMPointer? {
        // Get the underlying ERC721 address if it exists
        if let underlyingAddress = getUnderlyingERC721Address(coa, crossVMPointer.evmContractAddress) {
            for id in nftIDs {
                // Unwrap NFT if it is wrapped
                if isNFTWrapped(coa,
                    nftID: id,
                    underlying: underlyingAddress,
                    wrapper: crossVMPointer.evmContractAddress
                ) {
                    let res = mustCall(coa, crossVMPointer.evmContractAddress,
                        functionSig: "withdrawTo(address,uint256[])",
                        args: [coa.address(), [id]]
                    )
                    let decodedRes = EVM.decodeABI(types: [Type<Bool>()], data: res.data)
                    assert(decodedRes.length == 1, message: "Invalid response length")
                    assert(decodedRes[0] as! Bool, message: "Failed to unwrap NFT")
                }
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

/// Checks if the provided NFT is wrapped in the underlying ERC721 contract
///
access(all) fun isNFTWrapped(
    _ coa: auth(EVM.Call) &EVM.CadenceOwnedAccount,
    nftID: UInt256,
    underlying: EVM.EVMAddress,
    wrapper: EVM.EVMAddress
): Bool {
    let res = coa.call(
        to: underlying,
        data: EVM.encodeABIWithSignature("ownerOf(uint256)", [nftID]),
        gasLimit: 100_000,
        value: EVM.Balance(attoflow: 0)
    )

    // If the call fails, return false
    if res.status != EVM.Status.successful || res.data.length == 0{
        return false
    }

    // Decode and compare the addresses
    let decodedResult = EVM.decodeABI(
        types: [Type<EVM.EVMAddress>()],
        data: res.data
    )
    assert(decodedResult.length == 1, message: "Invalid response length")
    let owner = decodedResult[0] as! EVM.EVMAddress
    return owner.toString() == wrapper.toString()
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