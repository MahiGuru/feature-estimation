"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Sparkles,
  Brain,
  TrendingUp,
  Loader2,
  AlertCircle,
  RotateCcw,
} from "lucide-react";

interface LoadingScreenProps {
  isLoading: boolean;
  error: string | null;
  onRetry: () => void;
  onBackToForm: () => void;
}

export default function LoadingScreen({
  isLoading,
  error,
  onRetry,
  onBackToForm,
}: LoadingScreenProps) {
  const [loadingStep, setLoadingStep] = useState(0);
  const [progress, setProgress] = useState(0);

  const loadingSteps = [
    {
      icon: Brain,
      text: "Analyzing project requirements",
      detail: "Processing your feature specifications...",
    },
    {
      icon: TrendingUp,
      text: "Calculating effort estimations",
      detail: "Applying AI algorithms to estimate complexity...",
    },
    {
      icon: Sparkles,
      text: "Generating timeline predictions",
      detail: "Creating optimal resource allocation plans...",
    },
    {
      icon: TrendingUp,
      text: "Finalizing recommendations",
      detail: "Preparing your personalized project roadmap...",
    },
  ];

  useEffect(() => {
    if (!isLoading) return;

    const stepInterval = setInterval(() => {
      setLoadingStep((prev) => (prev + 1) % loadingSteps.length);
    }, 3000);

    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 95) return 95; // Cap at 95% until actual completion
        return prev + Math.random() * 15;
      });
    }, 500);

    return () => {
      clearInterval(stepInterval);
      clearInterval(progressInterval);
    };
  }, [isLoading, loadingSteps.length]);

  useEffect(() => {
    if (!isLoading) {
      setProgress(100);
    }
  }, [isLoading]);

  if (error) {
    return (
      <div className="fixed inset-0 z-[9999] bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 flex items-center justify-center p-6">
        <Card className="max-w-lg w-full mx-auto bg-white/80 backdrop-blur-sm border-red-200 shadow-2xl z-[10000]">
          <CardContent className="p-12 text-center">
            <div className="mb-8">
              <div className="p-4 bg-red-100 rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center">
                <AlertCircle className="w-10 h-10 text-red-600" />
              </div>
              <h2 className="text-3xl font-bold text-gray-800 mb-4">
                Oops! Something went wrong
              </h2>
              <p className="text-gray-600 leading-relaxed mb-2">
                We encountered an issue while generating your AI prediction.
              </p>
              <p className="text-sm text-gray-500 bg-gray-50 rounded-lg p-3 font-mono">
                {error}
              </p>
            </div>

            <div className="space-y-4">
              <Button
                onClick={onRetry}
                className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <RotateCcw className="w-5 h-5 mr-2" />
                Try Again
              </Button>

              <Button
                onClick={onBackToForm}
                variant="outline"
                className="w-full border-gray-300 hover:bg-gray-50 py-3 rounded-lg transition-all duration-300"
              >
                Back to Estimation Form
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!isLoading) return null;

  const currentStep = loadingSteps[loadingStep];
  const IconComponent = currentStep.icon;

  return (
    <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-6">
      {/* Additional overlay to prevent any clicks */}
      <div
        className="fixed inset-0 z-[9998]"
        style={{ pointerEvents: "auto" }}
      />

      <Card className="max-w-lg w-full mx-auto bg-white/98 backdrop-blur-sm border-blue-200 shadow-2xl ring-1 ring-blue-100 z-[10000]">
        <CardContent className="p-12 text-center">
          <div className="mb-8">
            {/* Animated Icon */}
            <div className="relative mb-8">
              <div className="p-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full w-24 h-24 mx-auto mb-6 flex items-center justify-center animate-pulse shadow-2xl">
                <IconComponent className="w-12 h-12 text-white" />
              </div>

              {/* Spinning outer ring */}
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-32 h-32">
                <div className="w-full h-full border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin"></div>
              </div>
            </div>

            <h2 className="text-3xl font-bold text-gray-800 mb-4">
              🤖 Generating AI Estimation
            </h2>

            <div className="space-y-4">
              <div className="bg-amber-50 rounded-lg p-4 border border-amber-200 mb-4">
                <p className="text-amber-800 font-semibold text-lg">
                  Please wait while we process your request
                </p>
                <p className="text-amber-700 text-sm mt-1">
                  Our AI is analyzing your features to provide accurate
                  estimates. This may take a moment.
                </p>
              </div>

              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <h3 className="text-lg font-semibold text-blue-900 mb-2 flex items-center justify-center">
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  {currentStep.text}
                </h3>
                <p className="text-blue-700 text-sm">{currentStep.detail}</p>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-blue-500 to-purple-600 h-full rounded-full transition-all duration-500 ease-out relative overflow-hidden"
                  style={{ width: `${progress}%` }}
                >
                  {/* Shimmer effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-25 animate-pulse"></div>
                </div>
              </div>

              <p className="text-sm text-gray-600">
                {Math.round(progress)}% Complete
              </p>
            </div>
          </div>

          <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-4">
            <h4 className="font-semibold text-purple-800 mb-2">
              🚀 What's happening?
            </h4>
            <ul className="text-sm text-purple-700 space-y-1 text-left">
              <li>• Analyzing feature complexity and dependencies</li>
              <li>• Calculating realistic timeline estimates</li>
              <li>• Optimizing resource allocation strategies</li>
              <li>• Creating visual project roadmaps</li>
            </ul>
          </div>

          <p className="text-xs text-gray-500 mt-6">
            This usually takes 10-30 seconds. Please don't refresh the page.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
