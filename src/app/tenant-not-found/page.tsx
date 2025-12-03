export default function TenantNotFoundPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4">
            <div className="max-w-md text-center space-y-6">
                <div className="flex justify-center">
                    <div className="bg-gray-200 p-6 rounded-full">
                        <svg
                            className="h-16 w-16 text-gray-600"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                            />
                        </svg>
                    </div>
                </div>

                <div className="space-y-2">
                    <h1 className="text-3xl font-bold text-gray-900">
                        Tenant Not Found
                    </h1>
                    <p className="text-gray-600">
                        We couldn't find an account with this subdomain.
                    </p>
                </div>

                <div className="bg-white p-6 rounded-lg space-y-4">
                    <p className="text-sm text-gray-600">
                        This could mean:
                    </p>
                    <ul className="text-left space-y-2 text-sm text-gray-600">
                        <li className="flex items-start gap-2">
                            <span className="text-blue-600 mt-0.5">•</span>
                            <span>The subdomain doesn't exist</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-blue-600 mt-0.5">•</span>
                            <span>There's a typo in the URL</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-blue-600 mt-0.5">•</span>
                            <span>The account has been deleted</span>
                        </li>
                    </ul>
                </div>

                <div className="space-y-3">
                    <p className="text-sm text-gray-600">
                        Want to create your own account?
                    </p>
                    <a
                        href="/register"
                        className="inline-block px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Start Free Trial
                    </a>
                </div>
            </div>
        </div>
    );
}
