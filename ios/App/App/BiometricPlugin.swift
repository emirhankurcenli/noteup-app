import Foundation
import Capacitor
import LocalAuthentication

@objc(BiometricPlugin)
public class BiometricPlugin: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "BiometricPlugin"
    public let jsName = "BiometricPlugin"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "authenticate", returnType: CAPPluginReturnPromise)
    ]

    @objc func authenticate(_ call: CAPPluginCall) {
        let title = call.getString("title") ?? "Not Kilitli"
        let subtitle = call.getString("subtitle") ?? "Notu açmak için Face ID, Touch ID veya cihaz şifrenizi girin"

        DispatchQueue.main.async {
            let context = LAContext()
            var error: NSError?

            // deviceOwnerAuthentication handles Face ID, Touch ID, AND iPad Passcode automatically
            if context.canEvaluatePolicy(.deviceOwnerAuthentication, error: &error) {
                let reason = "\(title): \(subtitle)"

                context.evaluatePolicy(.deviceOwnerAuthentication, localizedReason: reason) { success, evaluateError in
                    DispatchQueue.main.async {
                        if success {
                            call.resolve([
                                "success": true
                            ])
                        } else {
                            let errMsg = evaluateError?.localizedDescription ?? "Kimlik doğrulama başarısız oldu."
                            call.resolve([
                                "success": false,
                                "error": errMsg
                            ])
                        }
                    }
                }
            } else {
                let errMsg = error?.localizedDescription ?? "Biyometrik doğrulama veya cihaz şifresi kullanılamıyor."
                call.resolve([
                    "success": false,
                    "error": errMsg
                ])
            }
        }
    }
}
