import { useState, useEffect } from "react";
import { AppSidebar } from "@/components/dashboard/AppSidebar";
import { MobileNav } from "@/components/dashboard/MobileNav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

const Settings = () => {
    const [token, setToken] = useState("");
    const queryClient = useQueryClient();

    useEffect(() => {
        const savedToken = localStorage.getItem("apify_token");
        if (savedToken) setToken(savedToken);
    }, []);

    const handleSave = () => {
        if (!token.trim()) {
            toast.error("Please enter a valid token");
            return;
        }
        localStorage.setItem("apify_token", token.trim());
        toast.success("Token saved successfully!");

        // Invalidate queries to force re-fetch with new token
        queryClient.invalidateQueries({ queryKey: ["ads"] });
    };

    const handleClear = () => {
        localStorage.removeItem("apify_token");
        setToken("");
        toast.info("Token removed.");
        queryClient.invalidateQueries({ queryKey: ["ads"] });
    };

    return (
        <div className="flex min-h-screen w-full bg-background">
            <AppSidebar />
            <MobileNav />

            <div className="flex-1 flex flex-col min-w-0 p-6 space-y-6">
                <div>
                    <h1 className="text-lg font-semibold text-foreground">Settings</h1>
                    <p className="text-sm text-muted-foreground mt-0.5">
                        Manage your application configurations
                    </p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Apify Configuration</CardTitle>
                        <CardDescription>
                            Enter your Apify API Token to fetch real ads. If left empty, the app will try to use the environment variable.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="token">API Token</Label>
                            <Input
                                id="token"
                                type="password"
                                value={token}
                                onChange={(e) => setToken(e.target.value)}
                                placeholder="apify_api_..."
                            />
                        </div>
                        <div className="flex gap-2">
                            <Button onClick={handleSave}>Save Token</Button>
                            <Button variant="outline" onClick={handleClear}>Clear</Button>
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Note: The token is saved in your browser's Local Storage.
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default Settings;
