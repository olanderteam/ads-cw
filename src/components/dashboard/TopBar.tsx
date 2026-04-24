import { Search, RefreshCw, User, Calendar } from "lucide-react";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { logger } from "@/lib/logger";

interface TopBarProps {
  search: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
  dateRange?: { from: Date; to: Date };
  onDateRangeChange?: (range: { from: Date; to: Date } | undefined) => void;
  lastSyncedAt?: Date | null;
}

export function TopBar({
  search,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  dateRange,
  onDateRangeChange,
  lastSyncedAt,
}: TopBarProps) {
  const [relativeTime, setRelativeTime] = useState('');

  useEffect(() => {
    const update = () => {
      if (!lastSyncedAt) {
        setRelativeTime('Nunca sincronizado');
        return;
      }
      const diffMs = Date.now() - lastSyncedAt.getTime();
      const diffMin = Math.floor(diffMs / 60_000);
      if (diffMin < 1) {
        setRelativeTime('Sincronizado agora');
      } else {
        setRelativeTime(`Sincronizado há ${diffMin} min`);
      }
    };
    update();
    const interval = setInterval(update, 60_000);
    return () => clearInterval(interval);
  }, [lastSyncedAt]);
  return (
    <header className="sticky top-0 z-10 bg-card border-b border-border px-6 py-3 flex items-center justify-between gap-4">
      <div className="flex items-center gap-3 flex-1">
        <div className="relative max-w-xs w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search ads…"
            className="pl-9 h-9 text-sm bg-background"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>

        <Select value={statusFilter} onValueChange={onStatusFilterChange}>
          <SelectTrigger className="w-32 h-9 text-sm">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>

        {onDateRangeChange && (
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="h-9 text-sm justify-start text-left font-normal">
                <Calendar className="mr-2 h-4 w-4" />
                {dateRange?.from ? (
                  dateRange.to ? (
                    <>
                      {format(dateRange.from, "dd/MM/yyyy", { locale: ptBR })} -{" "}
                      {format(dateRange.to, "dd/MM/yyyy", { locale: ptBR })}
                    </>
                  ) : (
                    format(dateRange.from, "dd/MM/yyyy", { locale: ptBR })
                  )
                ) : (
                  <span>Selecionar período</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <div className="p-3 space-y-2">
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const today = new Date();
                      today.setHours(0, 0, 0, 0);
                      const last7Days = new Date(today);
                      last7Days.setDate(today.getDate() - 7);
                      last7Days.setHours(0, 0, 0, 0);
                      onDateRangeChange({ from: last7Days, to: today });
                    }}
                  >
                    Últimos 7 dias
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const today = new Date();
                      today.setHours(0, 0, 0, 0);
                      const last30Days = new Date(today);
                      last30Days.setDate(today.getDate() - 30);
                      last30Days.setHours(0, 0, 0, 0);
                      onDateRangeChange({ from: last30Days, to: today });
                    }}
                  >
                    Últimos 30 dias
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const today = new Date();
                      today.setHours(0, 0, 0, 0);
                      const last90Days = new Date(today);
                      last90Days.setDate(today.getDate() - 90);
                      last90Days.setHours(0, 0, 0, 0);
                      onDateRangeChange({ from: last90Days, to: today });
                    }}
                  >
                    Últimos 90 dias
                  </Button>
                </div>
                <CalendarComponent
                  mode="range"
                  selected={dateRange}
                  defaultMonth={dateRange?.from}
                  onSelect={(range: any) => {
                    // Handle range selection
                    if (range?.from && range?.to) {
                      const from = new Date(range.from);
                      from.setHours(0, 0, 0, 0);
                      const to = new Date(range.to);
                      to.setHours(23, 59, 59, 999);
                      onDateRangeChange({ from, to });
                    } else if (range?.from && !range?.to) {
                      const from = new Date(range.from);
                      from.setHours(0, 0, 0, 0);
                      const to = new Date(range.from);
                      to.setHours(23, 59, 59, 999);
                      onDateRangeChange({ from, to });
                    }
                  }}
                  numberOfMonths={2}
                  locale={ptBR}
                />
              </div>
            </PopoverContent>
          </Popover>
        )}
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <RefreshCw className="h-3 w-3" />
          <span>{relativeTime || 'Nunca sincronizado'}</span>
        </div>

        <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
          <User className="h-4 w-4 text-muted-foreground" />
        </div>
      </div>
    </header>
  );
}
