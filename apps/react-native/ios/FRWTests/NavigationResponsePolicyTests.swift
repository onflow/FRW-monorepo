//
//  NavigationResponsePolicyTests.swift
//  FRWTests
//
//  Tests for BrowserViewController.isAttachmentResponse(_:), which keeps
//  attachment/intended-for-download responses from rendering inline in the
//  in-app browser (#1436).
//

@testable import FRW_dev
import XCTest

final class NavigationResponsePolicyTests: XCTestCase {
    private let url = URL(string: "https://files.example.com/report")!

    private func makeResponse(contentType: String, disposition: String?) -> HTTPURLResponse {
        var headers = ["Content-Type": contentType]
        if let disposition {
            headers["Content-Disposition"] = disposition
        }
        return HTTPURLResponse(
            url: url,
            statusCode: 200,
            httpVersion: "HTTP/1.1",
            headerFields: headers
        )!
    }

    func test_htmlWithoutDisposition_isNotAttachment() {
        // The reported case requires the attachment disposition to trigger.
        let response = makeResponse(contentType: "text/html", disposition: nil)
        XCTAssertFalse(BrowserViewController.isAttachmentResponse(response))
    }

    func test_attachmentDisposition_isDetected() {
        // An HTML file a trusted host serves for download only.
        let response = makeResponse(
            contentType: "text/html",
            disposition: "attachment; filename=\"page.html\""
        )
        XCTAssertTrue(BrowserViewController.isAttachmentResponse(response))
    }

    func test_attachmentDisposition_isCaseInsensitive() {
        let response = makeResponse(
            contentType: "text/html",
            disposition: "ATTACHMENT; FILENAME=\"page.html\""
        )
        XCTAssertTrue(BrowserViewController.isAttachmentResponse(response))
    }

    func test_attachmentHeaderKeyLookup_isCaseInsensitive() {
        let response = HTTPURLResponse(
            url: url,
            statusCode: 200,
            httpVersion: "HTTP/1.1",
            headerFields: ["content-disposition": "attachment"]
        )!
        XCTAssertTrue(BrowserViewController.isAttachmentResponse(response))
    }

    func test_inlineDisposition_isNotAttachment() {
        let response = makeResponse(
            contentType: "text/html",
            disposition: "inline; filename=\"page.html\""
        )
        XCTAssertFalse(BrowserViewController.isAttachmentResponse(response))
    }

    func test_nonHttpResponse_isNotAttachment() {
        let response = URLResponse(
            url: url,
            mimeType: "text/html",
            expectedContentLength: 0,
            textEncodingName: nil
        )
        XCTAssertFalse(BrowserViewController.isAttachmentResponse(response))
    }
}
