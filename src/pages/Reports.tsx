import { AppSidebar } from "@/components/dashboard/AppSidebar";
import { MobileNav } from "@/components/dashboard/MobileNav";
import { AnalyticsSection } from "@/components/dashboard/AnalyticsSection";

const Reports = () => {
    return (
        <div className="flex min-h-screen w-full bg-background">
            <AppSidebar />
            <MobileNav />

            <div className="flex-1 flex flex-col min-w-0 p-6 space-y-6">
                <div>
                    <h1 className="text-lg font-semibold text-foreground">Reports</h1>
                    <p className="text-sm text-muted-foreground mt-0.5">
                        Performance analytics and insights
                    </p>
                </div>

                <AnalyticsSection />
            </div>
        </div>
    );
};

export default Reports;
