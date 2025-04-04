import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";
import { Link } from "wouter";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-50 dark:bg-slate-900">
      <Card className="w-full max-w-md mx-4 dark:bg-slate-800 dark:border-slate-700">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center text-center mb-4">
            <div className="text-5xl mb-4">☀️</div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Forecast ☀️ Fusion</h1>
            <div className="flex items-center mt-2 gap-2">
              <AlertCircle className="h-5 w-5 text-red-500" />
              <p className="text-lg text-red-500 font-medium">404 Page Not Found</p>
            </div>
          </div>

          <p className="mt-4 text-sm text-gray-600 dark:text-gray-300 text-center">
            The forecast you're looking for seems to have drifted away into the clouds.
          </p>
          
          <div className="mt-6 text-center">
            <Button asChild className="bg-blue-500 hover:bg-blue-600">
              <Link href="/">
                Return to Weather Dashboard
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
