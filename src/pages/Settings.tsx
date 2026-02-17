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
        const savedKey = localStorage.getItem("scraper_creators_key");
        if (savedKey) setToken(savedKey);
    }, []);

    const handleSave = () => {
        if (!token.trim()) {
            toast.error("Please enter a valid token");
            return;
        }
        localStorage.setItem("scraper_creators_key", token.trim());
        toast.success("API Key saved successfully!");

        // Invalidate queries to force re-fetch with new token
        queryClient.invalidateQueries({ queryKey: ["ads"] });
    };

    const handleClear = () => {
        localStorage.removeItem("scraper_creators_key");
        setToken("");
        toast.info("API Key removed.");
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
                        <CardTitle>Scraper Creators Configuration</CardTitle>
                        <CardDescription>
                            Enter your Scraper Creators API Key to fetch real ads. Using default key if empty.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="token">API Key</Label>
                            <Input
                                id="token"
                                type="password"
                                value={token}
                                onChange={(e) => setToken(e.target.value)}
                                placeholder="Enter API Key..."
                            />
                        </div>
                        <div className="flex gap-2">
                            <Button onClick={handleSave}>Save Key</Button>
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
