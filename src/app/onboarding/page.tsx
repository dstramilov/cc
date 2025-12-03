'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Rocket, Users, FolderKanban, Mail } from 'lucide-react';
import { useTenant } from '@/hooks/use-tenant';

export default function OnboardingPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { tenantName } = useTenant();
    const [step, setStep] = useState(1);
    const isNewAccount = searchParams.get('new') === 'true';

    const steps = [
        {
            title: 'Welcome to Customer Central!',
            description: `Your account for ${tenantName} is ready`,
            icon: Rocket,
            content: (
                <div className="space-y-4">
                    <p className="text-muted-foreground">
                        You're all set! Your 14-day free trial has started. Here's what you can do:
                    </p>
                    <ul className="space-y-3">
                        <li className="flex items-start gap-3">
                            <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                            <div>
                                <p className="font-medium">Invite your team</p>
                                <p className="text-sm text-muted-foreground">
                                    Add up to 5 users during your trial
                                </p>
                            </div>
                        </li>
                        <li className="flex items-start gap-3">
                            <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                            <div>
                                <p className="font-medium">Create projects</p>
                                <p className="text-sm text-muted-foreground">
                                    Track time, budgets, and milestones
                                </p>
                            </div>
                        </li>
                        <li className="flex items-start gap-3">
                            <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                            <div>
                                <p className="font-medium">Set up notifications</p>
                                <p className="text-sm text-muted-foreground">
                                    Get weekly summaries and budget alerts
                                </p>
                            </div>
                        </li>
                    </ul>
                </div>
            )
        },
        {
            title: 'Invite Your Team',
            description: 'Collaborate with your colleagues',
            icon: Users,
            content: (
                <div className="space-y-4">
                    <p className="text-muted-foreground">
                        Customer Central works best with your team. Invite members to:
                    </p>
                    <ul className="space-y-2 text-sm">
                        <li className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            Log time on projects
                        </li>
                        <li className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            Track progress and milestones
                        </li>
                        <li className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            Receive project updates
                        </li>
                    </ul>
                    <Button
                        className="w-full"
                        onClick={() => router.push('/settings?tab=users')}
                    >
                        <Users className="h-4 w-4 mr-2" />
                        Invite Team Members
                    </Button>
                </div>
            )
        },
        {
            title: 'Create Your First Project',
            description: 'Start tracking time and budgets',
            icon: FolderKanban,
            content: (
                <div className="space-y-4">
                    <p className="text-muted-foreground">
                        Projects are the heart of Customer Central. Each project can have:
                    </p>
                    <ul className="space-y-2 text-sm">
                        <li className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            Time tracking and budgets
                        </li>
                        <li className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            Milestones and deadlines
                        </li>
                        <li className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            Team assignments
                        </li>
                    </ul>
                    <Button
                        className="w-full"
                        onClick={() => router.push('/settings?tab=projects')}
                    >
                        <FolderKanban className="h-4 w-4 mr-2" />
                        Create First Project
                    </Button>
                </div>
            )
        },
        {
            title: 'Set Up Notifications',
            description: 'Stay informed about your projects',
            icon: Mail,
            content: (
                <div className="space-y-4">
                    <p className="text-muted-foreground">
                        Configure email notifications to stay on top of:
                    </p>
                    <ul className="space-y-2 text-sm">
                        <li className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            Weekly project summaries
                        </li>
                        <li className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            Budget alerts
                        </li>
                        <li className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            Milestone reminders
                        </li>
                    </ul>
                    <Button
                        className="w-full"
                        onClick={() => router.push('/settings?tab=notifications')}
                    >
                        <Mail className="h-4 w-4 mr-2" />
                        Configure Notifications
                    </Button>
                </div>
            )
        }
    ];

    const currentStep = steps[step - 1];
    const Icon = currentStep.icon;

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4">
            <Card className="w-full max-w-2xl shadow-xl">
                <CardHeader className="text-center">
                    <div className="flex justify-center mb-4">
                        <div className="bg-gradient-to-br from-blue-600 to-indigo-600 p-4 rounded-xl">
                            <Icon className="h-10 w-10 text-white" />
                        </div>
                    </div>
                    <CardTitle className="text-2xl">{currentStep.title}</CardTitle>
                    <CardDescription>{currentStep.description}</CardDescription>
                </CardHeader>

                <CardContent className="space-y-6">
                    {currentStep.content}

                    {/* Progress Dots */}
                    <div className="flex justify-center gap-2 pt-4">
                        {steps.map((_, idx) => (
                            <div
                                key={idx}
                                className={`h-2 w-2 rounded-full transition-all ${idx + 1 === step
                                        ? 'bg-blue-600 w-8'
                                        : idx + 1 < step
                                            ? 'bg-green-600'
                                            : 'bg-gray-300'
                                    }`}
                            />
                        ))}
                    </div>

                    {/* Navigation */}
                    <div className="flex justify-between pt-4">
                        {step > 1 ? (
                            <Button
                                variant="outline"
                                onClick={() => setStep(step - 1)}
                            >
                                Previous
                            </Button>
                        ) : (
                            <div />
                        )}

                        {step < steps.length ? (
                            <Button onClick={() => setStep(step + 1)}>
                                Next
                            </Button>
                        ) : (
                            <Button onClick={() => router.push('/')}>
                                Go to Dashboard
                            </Button>
                        )}
                    </div>

                    {/* Skip Option */}
                    <div className="text-center pt-2">
                        <button
                            onClick={() => router.push('/')}
                            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                        >
                            Skip onboarding and go to dashboard
                        </button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
