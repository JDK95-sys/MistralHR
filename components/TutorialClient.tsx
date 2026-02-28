"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import type { Step } from "react-joyride";

// Dynamically import Joyride with SSR disabled to prevent hydration errors
const Joyride = dynamic(() => import("react-joyride"), { ssr: false });

const steps: Step[] = [
    {
        target: ".nav-assistant",
        content: "Welcome to the People Portal! Here you can chat with the AI HR Assistant for immediate answers.",
        disableBeacon: true,
    },
    {
        target: ".nav-policies",
        content: "In the Policy Library, you can browse all company regulations. They open directly in the app now!",
    },
    {
        target: ".nav-jobs",
        content: "Check the Job Board to see internal opportunities and boost your career.",
    },
    {
        target: ".nav-analytics",
        content: "People Analytics provides insights on workforce data (available to specific roles).",
    },
    {
        target: ".nav-tools",
        content: "HR Tools contains useful utilities for HR professionals and employees.",
    },
];

export default function TutorialClient() {
    const [run, setRun] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        const handleStartTutorial = () => setRun(true);
        window.addEventListener("start-tutorial", handleStartTutorial);
        return () => window.removeEventListener("start-tutorial", handleStartTutorial);
    }, []);

    if (!mounted) return null;

    return (
        <Joyride
            steps={steps}
            run={run}
            continuous={true}
            showProgress={true}
            showSkipButton={true}
            styles={{
                options: {
                    primaryColor: "var(--mint)",
                    textColor: "var(--pepper)",
                    zIndex: 10000,
                },
                buttonNext: {
                    backgroundColor: "var(--mint)",
                    borderRadius: 8,
                    fontWeight: "bold",
                },
                buttonBack: {
                    color: "var(--text-secondary)",
                    marginRight: 10,
                },
                buttonSkip: {
                    color: "var(--text-secondary)",
                }
            }}
            callback={(data) => {
                const { status } = data;
                if (status === "finished" || status === "skipped") {
                    setRun(false);
                }
            }}
        />
    );
}
