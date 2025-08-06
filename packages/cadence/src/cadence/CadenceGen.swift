import Flow
import BigInt

/// Generated Cadence struct
struct StorageInfo: Decodable {
    let capacity: UInt64
    let used: UInt64
    let available: UInt64
}


/// Generated from Cadence filegis
enum CadenceGen: CadenceTargetType, MirrorAssociated {

    case getDelegator(address: Flow.Address)
    
    var cadenceBase64: String {
        switch self {
        case .getDelegator:
            return "aW1wb3J0IEZsb3dTdGFraW5nQ29sbGVjdGlvbiBmcm9tIDB4Rmxvd1N0YWtpbmdDb2xsZWN0aW9uCmltcG9ydCBGbG93SURUYWJsZVN0YWtpbmcgZnJvbSAweEZsb3dJRFRhYmxlU3Rha2luZwppbXBvcnQgTG9ja2VkVG9rZW5zIGZyb20gMHhMb2NrZWRUb2tlbnMKICAgICAgICAKYWNjZXNzKGFsbCkgZnVuIG1haW4oYWRkcmVzczogQWRkcmVzcyk6IFtGbG93SURUYWJsZVN0YWtpbmcuRGVsZWdhdG9ySW5mb10/IHsKICAgIHZhciByZXM6IFtGbG93SURUYWJsZVN0YWtpbmcuRGVsZWdhdG9ySW5mb10/ID0gbmlsCgogICAgbGV0IGluaXRlZCA9IEZsb3dTdGFraW5nQ29sbGVjdGlvbi5kb2VzQWNjb3VudEhhdmVTdGFraW5nQ29sbGVjdGlvbihhZGRyZXNzOiBhZGRyZXNzKQoKICAgIGlmIGluaXRlZCB7CiAgICAgICAgcmVzID0gRmxvd1N0YWtpbmdDb2xsZWN0aW9uLmdldEFsbERlbGVnYXRvckluZm8oYWRkcmVzczogYWRkcmVzcykKICAgIH0KICAgIHJldHVybiByZXMKfQo="
        }
    }
    
    var type: CadenceType {
        switch self {
        case .getDelegator:
            return .query
        }
    }
    
    var arguments: [Flow.Argument] {
        associatedValues.compactMap { $0.value.toFlowValue() }.toArguments()
    }
    
    var returnType: Decodable.Type {
        if type == .transaction {
            return Flow.ID.self
        }
        
        switch self {
        case .getDelegator:
            return [FlowIDTableStaking.DelegatorInfo]?.self
        }
    }
}

/// Generated from Cadence files in Child folder
extension CadenceGen {
    enum Child: CadenceTargetType, MirrorAssociated {

    case getChildAccountMeta(parent: Flow.Address)
    case getChildAddresses(parent: Flow.Address)
    
    var cadenceBase64: String {
        switch self {
        case .getChildAccountMeta:
            return "aW1wb3J0IEh5YnJpZEN1c3RvZHkgZnJvbSAweEh5YnJpZEN1c3RvZHkKaW1wb3J0IE1ldGFkYXRhVmlld3MgZnJvbSAweE1ldGFkYXRhVmlld3MKCmFjY2VzcyhhbGwpIGZ1biBtYWluKHBhcmVudDogQWRkcmVzcyk6IHtBZGRyZXNzOiBBbnlTdHJ1Y3R9IHsKICAgIGxldCBhY2N0ID0gZ2V0QXV0aEFjY291bnQ8YXV0aChTdG9yYWdlKSAmQWNjb3VudD4ocGFyZW50KQogICAgbGV0IG0gPSBhY2N0LnN0b3JhZ2UuYm9ycm93PCZIeWJyaWRDdXN0b2R5Lk1hbmFnZXI+KGZyb206IEh5YnJpZEN1c3RvZHkuTWFuYWdlclN0b3JhZ2VQYXRoKQoKICAgIGlmIG0gPT0gbmlsIHsKICAgICAgICByZXR1cm4ge30KICAgIH0gZWxzZSB7CiAgICAgICAgdmFyIGRhdGE6IHtBZGRyZXNzOiBBbnlTdHJ1Y3R9ID0ge30KICAgICAgICBmb3IgYWRkcmVzcyBpbiBtPy5nZXRDaGlsZEFkZHJlc3NlcygpISB7CiAgICAgICAgICAgIGxldCBjID0gbT8uZ2V0Q2hpbGRBY2NvdW50RGlzcGxheShhZGRyZXNzOiBhZGRyZXNzKSAKICAgICAgICAgICAgZGF0YS5pbnNlcnQoa2V5OiBhZGRyZXNzLCBjKQogICAgICAgIH0KICAgICAgICByZXR1cm4gZGF0YQogICAgfQp9Cg=="
        case .getChildAddresses:
            return "aW1wb3J0IEh5YnJpZEN1c3RvZHkgZnJvbSAweEh5YnJpZEN1c3RvZHkKCmFjY2VzcyhhbGwpIGZ1biBtYWluKHBhcmVudDogQWRkcmVzcyk6IFtBZGRyZXNzXSB7CiAgICBsZXQgYWNjdCA9IGdldEF1dGhBY2NvdW50PGF1dGgoU3RvcmFnZSkgJkFjY291bnQ+KHBhcmVudCkKICAgIGlmIGxldCBtYW5hZ2VyID0gYWNjdC5zdG9yYWdlLmJvcnJvdzwmSHlicmlkQ3VzdG9keS5NYW5hZ2VyPihmcm9tOiBIeWJyaWRDdXN0b2R5Lk1hbmFnZXJTdG9yYWdlUGF0aCkgewogICAgICAgIHJldHVybiAgbWFuYWdlci5nZXRDaGlsZEFkZHJlc3NlcygpCiAgICB9CiAgICByZXR1cm4gW10KfQo="
        }
    }
    
    var type: CadenceType {
        switch self {
        case .getChildAccountMeta:
            return .query
        case .getChildAddresses:
            return .query
        }
    }
    
    var arguments: [Flow.Argument] {
        associatedValues.compactMap { $0.value.toFlowValue() }.toArguments()
    }
    
    var returnType: Decodable.Type {
        if type == .transaction {
            return Flow.ID.self
        }
        
        switch self {
        case .getChildAccountMeta:
            return {Address: AnyStruct}.self
        case .getChildAddresses:
            return [Address].self
        }
    }
} }

/// Generated from Cadence files in Staking folder
extension CadenceGen {
    enum Staking: CadenceTargetType, MirrorAssociated {

    case getDelegatorInfo(address: Flow.Address)
    
    var cadenceBase64: String {
        switch self {
        case .getDelegatorInfo:
            return "aW1wb3J0IEZsb3dTdGFraW5nQ29sbGVjdGlvbiBmcm9tIDB4Rmxvd1N0YWtpbmdDb2xsZWN0aW9uCmltcG9ydCBGbG93SURUYWJsZVN0YWtpbmcgZnJvbSAweEZsb3dJRFRhYmxlU3Rha2luZwppbXBvcnQgTG9ja2VkVG9rZW5zIGZyb20gMHhMb2NrZWRUb2tlbnMKICAgICAgICAKYWNjZXNzKGFsbCkgZnVuIG1haW4oYWRkcmVzczogQWRkcmVzcyk6IFtGbG93SURUYWJsZVN0YWtpbmcuRGVsZWdhdG9ySW5mb10/IHsKICAgIHZhciByZXM6IFtGbG93SURUYWJsZVN0YWtpbmcuRGVsZWdhdG9ySW5mb10/ID0gbmlsCgogICAgbGV0IGluaXRlZCA9IEZsb3dTdGFraW5nQ29sbGVjdGlvbi5kb2VzQWNjb3VudEhhdmVTdGFraW5nQ29sbGVjdGlvbihhZGRyZXNzOiBhZGRyZXNzKQoKICAgIGlmIGluaXRlZCB7CiAgICAgICAgcmVzID0gRmxvd1N0YWtpbmdDb2xsZWN0aW9uLmdldEFsbERlbGVnYXRvckluZm8oYWRkcmVzczogYWRkcmVzcykKICAgIH0KICAgIHJldHVybiByZXMKfQo="
        }
    }
    
    var type: CadenceType {
        switch self {
        case .getDelegatorInfo:
            return .query
        }
    }
    
    var arguments: [Flow.Argument] {
        associatedValues.compactMap { $0.value.toFlowValue() }.toArguments()
    }
    
    var returnType: Decodable.Type {
        if type == .transaction {
            return Flow.ID.self
        }
        
        switch self {
        case .getDelegatorInfo:
            return [FlowIDTableStaking.DelegatorInfo]?.self
        }
    }
} }

/// Generated from Cadence files in EvmTransaction folder
extension CadenceGen {
    enum EvmTransaction: CadenceTargetType, MirrorAssociated {

    case callContract(toEVMAddressHex: String, amount: Decimal, data: [UInt8], gasLimit: UInt64)
    case createCoa(amount: Decimal)
    
    var cadenceBase64: String {
        switch self {
        case .callContract:
            return "aW1wb3J0IEZ1bmdpYmxlVG9rZW4gZnJvbSAweEZ1bmdpYmxlVG9rZW4KaW1wb3J0IEZsb3dUb2tlbiBmcm9tIDB4Rmxvd1Rva2VuCmltcG9ydCBFVk0gZnJvbSAweEVWTQoKLy8vIFRyYW5zZmVycyAkRkxPVyBmcm9tIHRoZSBzaWduZXIncyBhY2NvdW50IENhZGVuY2UgRmxvdyBiYWxhbmNlIHRvIHRoZSByZWNpcGllbnQncyBoZXgtZW5jb2RlZCBFVk0gYWRkcmVzcy4KLy8vIE5vdGUgdGhhdCBhIENPQSBtdXN0IGhhdmUgYSAkRkxPVyBiYWxhbmNlIGluIEVWTSBiZWZvcmUgdHJhbnNmZXJyaW5nIHZhbHVlIHRvIGFub3RoZXIgRVZNIGFkZHJlc3MuCi8vLwp0cmFuc2FjdGlvbih0b0VWTUFkZHJlc3NIZXg6IFN0cmluZywgYW1vdW50OiBVRml4NjQsIGRhdGE6IFtVSW50OF0sIGdhc0xpbWl0OiBVSW50NjQpIHsKCiAgICBsZXQgY29hOiBhdXRoKEVWTS5XaXRoZHJhdywgRVZNLkNhbGwpICZFVk0uQ2FkZW5jZU93bmVkQWNjb3VudAogICAgbGV0IHJlY2lwaWVudEVWTUFkZHJlc3M6IEVWTS5FVk1BZGRyZXNzCgogICAgcHJlcGFyZShzaWduZXI6IGF1dGgoQm9ycm93VmFsdWUsIFNhdmVWYWx1ZSkgJkFjY291bnQpIHsKICAgICAgICBpZiBzaWduZXIuc3RvcmFnZS50eXBlKGF0OiAvc3RvcmFnZS9ldm0pID09IG5pbCB7CiAgICAgICAgICAgIHNpZ25lci5zdG9yYWdlLnNhdmUoPC1FVk0uY3JlYXRlQ2FkZW5jZU93bmVkQWNjb3VudCgpLCB0bzogL3N0b3JhZ2UvZXZtKQogICAgICAgIH0KICAgICAgICBzZWxmLmNvYSA9IHNpZ25lci5zdG9yYWdlLmJvcnJvdzxhdXRoKEVWTS5XaXRoZHJhdywgRVZNLkNhbGwpICZFVk0uQ2FkZW5jZU93bmVkQWNjb3VudD4oZnJvbTogL3N0b3JhZ2UvZXZtKQogICAgICAgICAgICA/PyBwYW5pYygiQ291bGQgbm90IGJvcnJvdyByZWZlcmVuY2UgdG8gdGhlIHNpZ25lcidzIGJyaWRnZWQgYWNjb3VudCIpCgogICAgICAgIHNlbGYucmVjaXBpZW50RVZNQWRkcmVzcyA9IEVWTS5hZGRyZXNzRnJvbVN0cmluZyh0b0VWTUFkZHJlc3NIZXgpCiAgICB9CgogICAgZXhlY3V0ZSB7CiAgICAgICAgaWYgc2VsZi5yZWNpcGllbnRFVk1BZGRyZXNzLmJ5dGVzID09IHNlbGYuY29hLmFkZHJlc3MoKS5ieXRlcyB7CiAgICAgICAgICAgIHJldHVybgogICAgICAgIH0KICAgICAgICBsZXQgdmFsdWVCYWxhbmNlID0gRVZNLkJhbGFuY2UoYXR0b2Zsb3c6IDApCiAgICAgICAgdmFsdWVCYWxhbmNlLnNldEZMT1coZmxvdzogYW1vdW50KQogICAgICAgIGxldCB0eFJlc3VsdCA9IHNlbGYuY29hLmNhbGwoCiAgICAgICAgICAgIHRvOiBzZWxmLnJlY2lwaWVudEVWTUFkZHJlc3MsCiAgICAgICAgICAgIGRhdGE6IGRhdGEsCiAgICAgICAgICAgIGdhc0xpbWl0OiBnYXNMaW1pdCwKICAgICAgICAgICAgdmFsdWU6IHZhbHVlQmFsYW5jZQogICAgICAgICkKICAgICAgICBhc3NlcnQoCiAgICAgICAgICAgIHR4UmVzdWx0LnN0YXR1cyA9PSBFVk0uU3RhdHVzLmZhaWxlZCB8fCB0eFJlc3VsdC5zdGF0dXMgPT0gRVZNLlN0YXR1cy5zdWNjZXNzZnVsLAogICAgICAgICAgICBtZXNzYWdlOiAiZXZtX2Vycm9yPSIuY29uY2F0KHR4UmVzdWx0LmVycm9yTWVzc2FnZSkuY29uY2F0KCJcbiIpCiAgICAgICAgKQogICAgfQp9"
        case .createCoa:
            return "aW1wb3J0IEZ1bmdpYmxlVG9rZW4gZnJvbSAweEZ1bmdpYmxlVG9rZW4KaW1wb3J0IEZsb3dUb2tlbiBmcm9tIDB4Rmxvd1Rva2VuCmltcG9ydCBFVk0gZnJvbSAweEVWTQoKCi8vLyBDcmVhdGVzIGEgQ09BIGFuZCBzYXZlcyBpdCBpbiB0aGUgc2lnbmVyJ3MgRmxvdyBhY2NvdW50ICYgcGFzc2luZyB0aGUgZ2l2ZW4gdmFsdWUgb2YgRmxvdyBpbnRvIEZsb3dFVk0KdHJhbnNhY3Rpb24oYW1vdW50OiBVRml4NjQpIHsKICAgIGxldCBzZW50VmF1bHQ6IEBGbG93VG9rZW4uVmF1bHQKICAgIGxldCBhdXRoOiBhdXRoKElzc3VlU3RvcmFnZUNhcGFiaWxpdHlDb250cm9sbGVyLCBJc3N1ZVN0b3JhZ2VDYXBhYmlsaXR5Q29udHJvbGxlciwgUHVibGlzaENhcGFiaWxpdHksIFNhdmVWYWx1ZSwgVW5wdWJsaXNoQ2FwYWJpbGl0eSkgJkFjY291bnQKCiAgICBwcmVwYXJlKHNpZ25lcjogYXV0aChCb3Jyb3dWYWx1ZSwgSXNzdWVTdG9yYWdlQ2FwYWJpbGl0eUNvbnRyb2xsZXIsIFB1Ymxpc2hDYXBhYmlsaXR5LCBTYXZlVmFsdWUsIFVucHVibGlzaENhcGFiaWxpdHkpICZBY2NvdW50KSB7CiAgICAgICAgbGV0IHZhdWx0UmVmID0gc2lnbmVyLnN0b3JhZ2UuYm9ycm93PGF1dGgoRnVuZ2libGVUb2tlbi5XaXRoZHJhdykgJkZsb3dUb2tlbi5WYXVsdD4oCiAgICAgICAgICAgICAgICBmcm9tOiAvc3RvcmFnZS9mbG93VG9rZW5WYXVsdAogICAgICAgICAgICApID8/IHBhbmljKCJDb3VsZCBub3QgYm9ycm93IHJlZmVyZW5jZSB0byB0aGUgb3duZXIncyBWYXVsdCEiKQoKICAgICAgICBzZWxmLnNlbnRWYXVsdCA8LSB2YXVsdFJlZi53aXRoZHJhdyhhbW91bnQ6IGFtb3VudCkgYXMhIEBGbG93VG9rZW4uVmF1bHQKICAgICAgICBzZWxmLmF1dGggPSBzaWduZXIKICAgIH0KCiAgICBleGVjdXRlIHsKICAgICAgICBsZXQgY29hIDwtIEVWTS5jcmVhdGVDYWRlbmNlT3duZWRBY2NvdW50KCkKICAgICAgICBjb2EuZGVwb3NpdChmcm9tOiA8LXNlbGYuc2VudFZhdWx0KQoKICAgICAgICBsb2coY29hLmJhbGFuY2UoKS5pbkZMT1coKSkKICAgICAgICBsZXQgc3RvcmFnZVBhdGggPSBTdG9yYWdlUGF0aChpZGVudGlmaWVyOiAiZXZtIikhCiAgICAgICAgbGV0IHB1YmxpY1BhdGggPSBQdWJsaWNQYXRoKGlkZW50aWZpZXI6ICJldm0iKSEKICAgICAgICBzZWxmLmF1dGguc3RvcmFnZS5zYXZlPEBFVk0uQ2FkZW5jZU93bmVkQWNjb3VudD4oPC1jb2EsIHRvOiBzdG9yYWdlUGF0aCkKICAgICAgICBsZXQgYWRkcmVzc2FibGVDYXAgPSBzZWxmLmF1dGguY2FwYWJpbGl0aWVzLnN0b3JhZ2UuaXNzdWU8JkVWTS5DYWRlbmNlT3duZWRBY2NvdW50PihzdG9yYWdlUGF0aCkKICAgICAgICBzZWxmLmF1dGguY2FwYWJpbGl0aWVzLnVucHVibGlzaChwdWJsaWNQYXRoKQogICAgICAgIHNlbGYuYXV0aC5jYXBhYmlsaXRpZXMucHVibGlzaChhZGRyZXNzYWJsZUNhcCwgYXQ6IHB1YmxpY1BhdGgpCiAgICB9Cn0="
        }
    }
    
    var type: CadenceType {
        switch self {
        case .callContract:
            return .transaction
        case .createCoa:
            return .transaction
        }
    }
    
    var arguments: [Flow.Argument] {
        associatedValues.compactMap { $0.value.toFlowValue() }.toArguments()
    }
    
    var returnType: Decodable.Type {
        if type == .transaction {
            return Flow.ID.self
        }
        
        switch self {
        case .callContract:
            return Flow.ID.self
        case .createCoa:
            return Flow.ID.self
        }
    }
} }

/// Generated from Cadence files in Token folder
extension CadenceGen {
    enum Token: CadenceTargetType, MirrorAssociated {

    case getTokenBalanceStorage(address: Flow.Address)
    
    var cadenceBase64: String {
        switch self {
        case .getTokenBalanceStorage:
            return "aW1wb3J0IEZ1bmdpYmxlVG9rZW4gZnJvbSAweEZ1bmdpYmxlVG9rZW4KCi8vLyBRdWVyaWVzIGZvciBGVC5WYXVsdCBiYWxhbmNlIG9mIGFsbCBGVC5WYXVsdHMgaW4gdGhlIHNwZWNpZmllZCBhY2NvdW50LgovLy8KYWNjZXNzKGFsbCkgZnVuIG1haW4oYWRkcmVzczogQWRkcmVzcyk6IHtTdHJpbmc6IFVGaXg2NH0gewogICAgLy8gR2V0IHRoZSBhY2NvdW50CiAgICBsZXQgYWNjb3VudCA9IGdldEF1dGhBY2NvdW50PGF1dGgoQm9ycm93VmFsdWUpICZBY2NvdW50PihhZGRyZXNzKQogICAgLy8gSW5pdCBmb3IgcmV0dXJuIHZhbHVlCiAgICBsZXQgYmFsYW5jZXM6IHtTdHJpbmc6IFVGaXg2NH0gPSB7fQogICAgLy8gVHJhY2sgc2VlbiBUeXBlcyBpbiBhcnJheQogICAgbGV0IHNlZW46IFtTdHJpbmddID0gW10KICAgIC8vIEFzc2lnbiB0aGUgdHlwZSB3ZSdsbCBuZWVkCiAgICBsZXQgdmF1bHRUeXBlOiBUeXBlID0gVHlwZTxAe0Z1bmdpYmxlVG9rZW4uVmF1bHR9PigpCiAgICAvLyBJdGVyYXRlIG92ZXIgYWxsIHN0b3JlZCBpdGVtcyAmIGdldCB0aGUgcGF0aCBpZiB0aGUgdHlwZSBpcyB3aGF0IHdlJ3JlIGxvb2tpbmcgZm9yCiAgICBhY2NvdW50LnN0b3JhZ2UuZm9yRWFjaFN0b3JlZChmdW4gKHBhdGg6IFN0b3JhZ2VQYXRoLCB0eXBlOiBUeXBlKTogQm9vbCB7CiAgICAgICAgaWYgIXR5cGUuaXNSZWNvdmVyZWQgJiYgKHR5cGUuaXNJbnN0YW5jZSh2YXVsdFR5cGUpIHx8IHR5cGUuaXNTdWJ0eXBlKG9mOiB2YXVsdFR5cGUpKSB7CiAgICAgICAgICAgIC8vIEdldCBhIHJlZmVyZW5jZSB0byB0aGUgcmVzb3VyY2UgJiBpdHMgYmFsYW5jZQogICAgICAgICAgICBsZXQgdmF1bHRSZWYgPSBhY2NvdW50LnN0b3JhZ2UuYm9ycm93PCZ7RnVuZ2libGVUb2tlbi5CYWxhbmNlfT4oZnJvbTogcGF0aCkhCiAgICAgICAgICAgIC8vIEluc2VydCBhIG5ldyB2YWx1ZXMgaWYgaXQncyB0aGUgZmlyc3QgdGltZSB3ZSd2ZSBzZWVuIHRoZSB0eXBlCiAgICAgICAgICAgIGlmICFzZWVuLmNvbnRhaW5zKHR5cGUuaWRlbnRpZmllcikgewogICAgICAgICAgICAgICAgYmFsYW5jZXMuaW5zZXJ0KGtleTogdHlwZS5pZGVudGlmaWVyLCB2YXVsdFJlZi5iYWxhbmNlKQogICAgICAgICAgICB9IGVsc2UgewogICAgICAgICAgICAgICAgLy8gT3RoZXJ3aXNlIGp1c3QgdXBkYXRlIHRoZSBiYWxhbmNlIG9mIHRoZSB2YXVsdCAodW5saWtlbHkgd2UnbGwgc2VlIHRoZSBzYW1lIHR5cGUgdHdpY2UgaW4KICAgICAgICAgICAgICAgIC8vIHRoZSBzYW1lIGFjY291bnQsIGJ1dCB3ZSB3YW50IHRvIGNvdmVyIHRoZSBjYXNlKQogICAgICAgICAgICAgICAgYmFsYW5jZXNbdHlwZS5pZGVudGlmaWVyXSA9IGJhbGFuY2VzW3R5cGUuaWRlbnRpZmllcl0hICsgdmF1bHRSZWYuYmFsYW5jZQogICAgICAgICAgICB9CiAgICAgICAgfQogICAgICAgIHJldHVybiB0cnVlCiAgICB9KQoKICAgIC8vIEFkZCBhdmFpbGFibGUgRmxvdyBUb2tlbiBCYWxhbmNlCiAgICBiYWxhbmNlcy5pbnNlcnQoa2V5OiAiYXZhaWxhYmxlRmxvd1Rva2VuIiwgYWNjb3VudC5hdmFpbGFibGVCYWxhbmNlKQoKICAgIHJldHVybiBiYWxhbmNlcwp9"
        }
    }
    
    var type: CadenceType {
        switch self {
        case .getTokenBalanceStorage:
            return .query
        }
    }
    
    var arguments: [Flow.Argument] {
        associatedValues.compactMap { $0.value.toFlowValue() }.toArguments()
    }
    
    var returnType: Decodable.Type {
        if type == .transaction {
            return Flow.ID.self
        }
        
        switch self {
        case .getTokenBalanceStorage:
            return {String: UFix64}.self
        }
    }
} }

/// Generated from Cadence files in Base folder
extension CadenceGen {
    enum Base: CadenceTargetType, MirrorAssociated {

    case accountStorage(addr: Flow.Address)
    
    var cadenceBase64: String {
        switch self {
        case .accountStorage:
            return "YWNjZXNzKGFsbCkgCnN0cnVjdCBTdG9yYWdlSW5mbyB7CiAgICBhY2Nlc3MoYWxsKSBsZXQgY2FwYWNpdHk6IFVJbnQ2NAogICAgYWNjZXNzKGFsbCkgbGV0IHVzZWQ6IFVJbnQ2NAogICAgYWNjZXNzKGFsbCkgbGV0IGF2YWlsYWJsZTogVUludDY0CgogICAgaW5pdChjYXBhY2l0eTogVUludDY0LCB1c2VkOiBVSW50NjQsIGF2YWlsYWJsZTogVUludDY0KSB7CiAgICAgICAgc2VsZi5jYXBhY2l0eSA9IGNhcGFjaXR5CiAgICAgICAgc2VsZi51c2VkID0gdXNlZAogICAgICAgIHNlbGYuYXZhaWxhYmxlID0gYXZhaWxhYmxlCiAgICB9Cn0KCmFjY2VzcyhhbGwpIGZ1biBtYWluKGFkZHI6IEFkZHJlc3MpOiBTdG9yYWdlSW5mbyB7CiAgICBsZXQgYWNjdDogJkFjY291bnQgPSBnZXRBY2NvdW50KGFkZHIpCiAgICByZXR1cm4gU3RvcmFnZUluZm8oY2FwYWNpdHk6IGFjY3Quc3RvcmFnZS5jYXBhY2l0eSwKICAgICAgICAgICAgICAgICAgICAgIHVzZWQ6IGFjY3Quc3RvcmFnZS51c2VkLAogICAgICAgICAgICAgICAgICAgICAgYXZhaWxhYmxlOiBhY2N0LnN0b3JhZ2UuY2FwYWNpdHkgLSBhY2N0LnN0b3JhZ2UudXNlZCkKfSA="
        }
    }
    
    var type: CadenceType {
        switch self {
        case .accountStorage:
            return .query
        }
    }
    
    var arguments: [Flow.Argument] {
        associatedValues.compactMap { $0.value.toFlowValue() }.toArguments()
    }
    
    var returnType: Decodable.Type {
        if type == .transaction {
            return Flow.ID.self
        }
        
        switch self {
        case .accountStorage:
            return StorageInfo.self
        }
    }
} }

/// Generated from Cadence files in EvmScripts folder
extension CadenceGen {
    enum EvmScripts: CadenceTargetType, MirrorAssociated {

    case getAddr(flowAddress: Flow.Address)
    
    var cadenceBase64: String {
        switch self {
        case .getAddr:
            return "aW1wb3J0IEVWTSBmcm9tIDB4RVZNCgphY2Nlc3MoYWxsKSBmdW4gbWFpbihmbG93QWRkcmVzczogQWRkcmVzcyk6IFN0cmluZz8gewogICAgaWYgbGV0IGFkZHJlc3M6IEVWTS5FVk1BZGRyZXNzID0gZ2V0QXV0aEFjY291bnQ8YXV0aChCb3Jyb3dWYWx1ZSkgJkFjY291bnQ+KGZsb3dBZGRyZXNzKQogICAgICAgIC5zdG9yYWdlLmJvcnJvdzwmRVZNLkNhZGVuY2VPd25lZEFjY291bnQ+KGZyb206IC9zdG9yYWdlL2V2bSk/LmFkZHJlc3MoKSB7CiAgICAgICAgbGV0IGJ5dGVzOiBbVUludDhdID0gW10KICAgICAgICBmb3IgYnl0ZSBpbiBhZGRyZXNzLmJ5dGVzIHsKICAgICAgICAgICAgYnl0ZXMuYXBwZW5kKGJ5dGUpCiAgICAgICAgfQogICAgICAgIHJldHVybiBTdHJpbmcuZW5jb2RlSGV4KGJ5dGVzKQogICAgfQogICAgcmV0dXJuIG5pbAp9"
        }
    }
    
    var type: CadenceType {
        switch self {
        case .getAddr:
            return .query
        }
    }
    
    var arguments: [Flow.Argument] {
        associatedValues.compactMap { $0.value.toFlowValue() }.toArguments()
    }
    
    var returnType: Decodable.Type {
        if type == .transaction {
            return Flow.ID.self
        }
        
        switch self {
        case .getAddr:
            return String?.self
        }
    }
} }

public enum CadenceType: String {
    case query
    case transaction
}

public protocol CadenceTargetType {
    
    /// The target's base `URL`.
    var cadenceBase64: String { get }

    /// The HTTP method used in the request.
    var type: CadenceType { get }
    
    /// The return type for decoding
    var returnType: Decodable.Type { get }
    
    var arguments: [Flow.Argument] { get }
}
