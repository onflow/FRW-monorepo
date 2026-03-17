//
//  EventTrack+ViewName.swift
//  FRW
//
//  Created by cat on 5/14/25.
//

import LuciqSDK
import SwiftUI

extension View {
    @ViewBuilder
    func tracedView(_ view: some View) -> some View {
        luciqTracedView(name: viewClassName(view))
    }

    func viewClassName(_ view: Any) -> String {
        let name = String(describing: type(of: view))
        return name.replacingOccurrences(of: "SwiftUI.", with: "")
    }
}
