export default function SuspendedPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-50 p-4">
            <div className="max-w-md text-center space-y-6">
                <div className="flex justify-center">
                    <div className="bg-red-100 p-6 rounded-full">
                        <svg
                            className="h-16 w-16 text-red-600"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                            />
                        </svg>
                    </div>
                </div>

                <div className="space-y-2">
                    <h1 className="text-3xl font-bold text-gray-900">
                        Account Suspended
                    </h1>
                    <p className="text-gray-600">
                        This account has been suspended. This may be due to:
                    </p>
                </div>

                <ul className="text-left space-y-2 text-sm text-gray-600 bg-white p-4 rounded-lg">
                    <li className="flex items-start gap-2">
                        <span className="text-red-600 mt-0.5">•</span>
                        <span>Payment issues or expired subscription</span>
                    </li>
                    <li className="flex items-start gap-2">
                        <span className="text-red-600 mt-0.5">•</span>
                        <span>Terms of service violation</span>
                    </li>
                    <li className="flex items-start gap-2">
                        <span className="text-red-600 mt-0.5">•</span>
                        <span>Account cancellation</span>
                    </li>
                </ul>

                <div className="space-y-3">
                    <p className="text-sm text-gray-600">
                        To reactivate your account, please contact support:
                    </p>
                    <a
                        href="mailto:support@yourcentralapp.com"
                        className="inline-block px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Contact Support
                    </a>
                </div>
            </div>
        </div>
    );
}
