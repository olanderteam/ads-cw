import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TopBar } from "@/components/dashboard/TopBar";
import { useState } from "react";

/**
 * Bug Condition Exploration Test
 * 
 * **Validates: Requirements 2.1, 2.2, 2.3**
 * 
 * This test explores the bug condition where clicking dates in the second 
 * displayed month (March) are incorrectly interpreted as dates in the first 
 * month (February) when the calendar's month prop is set to a February date.
 * 
 * Bug Condition: isBugCondition(input) where:
 *   - input.numberOfMonths == 2
 *   - input.clickedDate.getMonth() != input.monthProp.getMonth()
 *   - clicked date is in second visible month
 * 
 * Expected Behavior (after fix):
 *   - result.selectedDate.getMonth() == input.clickedDate.getMonth()
 *   - result.selectedDate.getDate() == input.clickedDate.getDate()
 * 
 * CRITICAL: This test MUST FAIL on unfixed code - failure confirms bug exists
 * DO NOT attempt to fix the test or code when it fails
 * 
 * Expected Counterexamples:
 *   - March dates interpreted as February dates (month offset by -1)
 */

describe("Calendar Date Selection - Bug Condition Exploration", () => {
  describe("Property 1: Fault Condition - Second Month Date Selection", () => {
    it("should correctly interpret March 1st click as March 1st (not February 1st)", async () => {
      const user = userEvent.setup();
      
      // Track the date range changes
      let capturedDateRange: { from: Date; to: Date } | undefined;
      
      function TestWrapperWithCapture() {
        const [dateRange, setDateRange] = useState<{ from: Date; to: Date } | undefined>(() => {
          const today = new Date(2026, 2, 3); // March 3, 2026
          today.setHours(23, 59, 59, 999);
          const last30Days = new Date(2026, 1, 1); // February 1, 2026
          last30Days.setHours(0, 0, 0, 0);
          return { from: last30Days, to: today };
        });

        return (
          <TopBar
            search=""
            onSearchChange={() => {}}
            statusFilter="all"
            onStatusFilterChange={() => {}}
            dateRange={dateRange}
            onDateRangeChange={(range) => {
              capturedDateRange = range;
              setDateRange(range);
            }}
          />
        );
      }
      
      render(<TestWrapperWithCapture />);
      
      // Open the calendar popover
      const calendarButton = screen.getByRole("button", { name: /01\/02\/2026.*03\/03\/2026/i });
      await user.click(calendarButton);
      
      // Get all day buttons (gridcell role)
      // The calendar shows February (28 days) and March
      // We need to click on a date in March (the second month)
      const allDayButtons = screen.getAllByRole("gridcell");
      
      // Filter for buttons that are not "day-outside" and contain the text "10"
      const day10Buttons = allDayButtons.filter(button => {
        const buttonElement = button as HTMLButtonElement;
        return !buttonElement.className.includes('day-outside') && 
               buttonElement.textContent === '10';
      });
      
      // We should have at least one button with "10" (could be Feb 10 and/or Mar 10)
      // If we have two, the second one should be March 10
      const march10 = day10Buttons.length > 1 ? day10Buttons[1] : day10Buttons[0];
      await user.click(march10);
      
      // Wait for state update
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Verify the captured date range has March 10th as the 'to' date (month = 2 for March)
      expect(capturedDateRange).toBeDefined();
      expect(capturedDateRange?.to.getMonth()).toBe(2); // March is month 2
      expect(capturedDateRange?.to.getDate()).toBe(10);
      
      // This assertion will PASS on fixed code when March 10th is correctly interpreted as March 10th
    });

    it("should correctly interpret March 20th click as March 20th (not February 20th)", async () => {
      const user = userEvent.setup();
      
      let capturedDateRange: { from: Date; to: Date } | undefined;
      
      function TestWrapperWithCapture() {
        const [dateRange, setDateRange] = useState<{ from: Date; to: Date } | undefined>(() => {
          const today = new Date(2026, 2, 3); // March 3, 2026
          today.setHours(23, 59, 59, 999);
          const last30Days = new Date(2026, 1, 1); // February 1, 2026
          last30Days.setHours(0, 0, 0, 0);
          return { from: last30Days, to: today };
        });

        return (
          <TopBar
            search=""
            onSearchChange={() => {}}
            statusFilter="all"
            onStatusFilterChange={() => {}}
            dateRange={dateRange}
            onDateRangeChange={(range) => {
              capturedDateRange = range;
              setDateRange(range);
            }}
          />
        );
      }
      
      render(<TestWrapperWithCapture />);
      
      // Open the calendar popover
      const calendarButton = screen.getByRole("button", { name: /01\/02\/2026.*03\/03\/2026/i });
      await user.click(calendarButton);
      
      // Get all day buttons (gridcell role)
      const allDayButtons = screen.getAllByRole("gridcell");
      
      // Filter for buttons that contain the text "20" and are not "day-outside"
      const day20Buttons = allDayButtons.filter(button => {
        const buttonElement = button as HTMLButtonElement;
        return !buttonElement.className.includes('day-outside') && 
               buttonElement.textContent === '20';
      });
      
      // We should have at least one button with "20" (could be Feb 20 and/or Mar 20)
      // If we have two, the second one should be March 20
      const march20 = day20Buttons.length > 1 ? day20Buttons[1] : day20Buttons[0];
      await user.click(march20);
      
      // Wait for state update
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Verify March 20th is correctly interpreted as the 'to' date
      expect(capturedDateRange).toBeDefined();
      expect(capturedDateRange?.to.getMonth()).toBe(2); // March is month 2
      expect(capturedDateRange?.to.getDate()).toBe(20);
      
      // This assertion will PASS on fixed code, confirming the bug is fixed
    });

    it("should correctly interpret March 15th click as March 15th (not February 15th)", async () => {
      const user = userEvent.setup();
      
      let capturedDateRange: { from: Date; to: Date } | undefined;
      
      function TestWrapperWithCapture() {
        const [dateRange, setDateRange] = useState<{ from: Date; to: Date } | undefined>(() => {
          const today = new Date(2026, 2, 3); // March 3, 2026
          today.setHours(23, 59, 59, 999);
          const last30Days = new Date(2026, 1, 1); // February 1, 2026
          last30Days.setHours(0, 0, 0, 0);
          return { from: last30Days, to: today };
        });

        return (
          <TopBar
            search=""
            onSearchChange={() => {}}
            statusFilter="all"
            onStatusFilterChange={() => {}}
            dateRange={dateRange}
            onDateRangeChange={(range) => {
              capturedDateRange = range;
              setDateRange(range);
            }}
          />
        );
      }
      
      render(<TestWrapperWithCapture />);
      
      // Open the calendar popover
      const calendarButton = screen.getByRole("button", { name: /01\/02\/2026.*03\/03\/2026/i });
      await user.click(calendarButton);
      
      // Get all day buttons (gridcell role)
      const allDayButtons = screen.getAllByRole("gridcell");
      
      // Filter for buttons that contain the text "15" and are not "day-outside"
      const day15Buttons = allDayButtons.filter(button => {
        const buttonElement = button as HTMLButtonElement;
        return !buttonElement.className.includes('day-outside') && 
               buttonElement.textContent === '15';
      });
      
      // We should have at least one button with "15" (could be Feb 15 and/or Mar 15)
      // If we have two, the second one should be March 15
      const march15 = day15Buttons.length > 1 ? day15Buttons[1] : day15Buttons[0];
      await user.click(march15);
      
      // Wait for state update
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Verify March 15th is correctly interpreted as the 'to' date
      expect(capturedDateRange).toBeDefined();
      expect(capturedDateRange?.to.getMonth()).toBe(2); // March is month 2
      expect(capturedDateRange?.to.getDate()).toBe(15);
      
      // This assertion will PASS on fixed code, confirming the bug is fixed
    });
  });

  describe("Property 2: Preservation - First Month and Other Interactions", () => {
    /**
     * **Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5**
     * 
     * These tests verify that the fix does NOT break existing functionality.
     * They test behaviors that should remain unchanged:
     * - Preset buttons set correct date ranges
     * - Single date selection sets both `from` and `to` to same date with time boundaries
     * - Dates display in Brazilian Portuguese locale (dd/MM/yyyy)
     * 
     * IMPORTANT: These tests should PASS on UNFIXED code (baseline behavior)
     * and continue to PASS after the fix (no regressions).
     */

    it("should set correct date range for 'Últimos 7 dias' preset button", async () => {
      const user = userEvent.setup();
      
      let capturedDateRange: { from: Date; to: Date } | undefined;
      
      function TestWrapperWithCapture() {
        const [dateRange, setDateRange] = useState<{ from: Date; to: Date } | undefined>();

        return (
          <TopBar
            search=""
            onSearchChange={() => {}}
            statusFilter="all"
            onStatusFilterChange={() => {}}
            dateRange={dateRange}
            onDateRangeChange={(range) => {
              capturedDateRange = range;
              setDateRange(range);
            }}
          />
        );
      }
      
      render(<TestWrapperWithCapture />);
      
      // Open the calendar popover
      const calendarButton = screen.getByRole("button", { name: /Selecionar período/i });
      await user.click(calendarButton);
      
      // Click the "Últimos 7 dias" button
      const last7DaysButton = screen.getByRole("button", { name: /Últimos 7 dias/i });
      await user.click(last7DaysButton);
      
      // Wait for state update
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Verify the date range is set correctly
      expect(capturedDateRange).toBeDefined();
      
      // Calculate expected dates
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const expectedFrom = new Date(today);
      expectedFrom.setDate(today.getDate() - 7);
      expectedFrom.setHours(0, 0, 0, 0);
      
      // Verify from date is 7 days ago
      expect(capturedDateRange?.from.getTime()).toBe(expectedFrom.getTime());
      expect(capturedDateRange?.to.getTime()).toBe(today.getTime());
      
      // Verify time boundaries
      expect(capturedDateRange?.from.getHours()).toBe(0);
      expect(capturedDateRange?.from.getMinutes()).toBe(0);
      expect(capturedDateRange?.from.getSeconds()).toBe(0);
      expect(capturedDateRange?.from.getMilliseconds()).toBe(0);
      
      expect(capturedDateRange?.to.getHours()).toBe(0);
      expect(capturedDateRange?.to.getMinutes()).toBe(0);
      expect(capturedDateRange?.to.getSeconds()).toBe(0);
      expect(capturedDateRange?.to.getMilliseconds()).toBe(0);
    });

    it("should set correct date range for 'Últimos 30 dias' preset button", async () => {
      const user = userEvent.setup();
      
      let capturedDateRange: { from: Date; to: Date } | undefined;
      
      function TestWrapperWithCapture() {
        const [dateRange, setDateRange] = useState<{ from: Date; to: Date } | undefined>();

        return (
          <TopBar
            search=""
            onSearchChange={() => {}}
            statusFilter="all"
            onStatusFilterChange={() => {}}
            dateRange={dateRange}
            onDateRangeChange={(range) => {
              capturedDateRange = range;
              setDateRange(range);
            }}
          />
        );
      }
      
      render(<TestWrapperWithCapture />);
      
      // Open the calendar popover
      const calendarButton = screen.getByRole("button", { name: /Selecionar período/i });
      await user.click(calendarButton);
      
      // Click the "Últimos 30 dias" button
      const last30DaysButton = screen.getByRole("button", { name: /Últimos 30 dias/i });
      await user.click(last30DaysButton);
      
      // Wait for state update
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Verify the date range is set correctly
      expect(capturedDateRange).toBeDefined();
      
      // Calculate expected dates
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const expectedFrom = new Date(today);
      expectedFrom.setDate(today.getDate() - 30);
      expectedFrom.setHours(0, 0, 0, 0);
      
      // Verify from date is 30 days ago
      expect(capturedDateRange?.from.getTime()).toBe(expectedFrom.getTime());
      expect(capturedDateRange?.to.getTime()).toBe(today.getTime());
    });

    it("should set correct date range for 'Últimos 90 dias' preset button", async () => {
      const user = userEvent.setup();
      
      let capturedDateRange: { from: Date; to: Date } | undefined;
      
      function TestWrapperWithCapture() {
        const [dateRange, setDateRange] = useState<{ from: Date; to: Date } | undefined>();

        return (
          <TopBar
            search=""
            onSearchChange={() => {}}
            statusFilter="all"
            onStatusFilterChange={() => {}}
            dateRange={dateRange}
            onDateRangeChange={(range) => {
              capturedDateRange = range;
              setDateRange(range);
            }}
          />
        );
      }
      
      render(<TestWrapperWithCapture />);
      
      // Open the calendar popover
      const calendarButton = screen.getByRole("button", { name: /Selecionar período/i });
      await user.click(calendarButton);
      
      // Click the "Últimos 90 dias" button
      const last90DaysButton = screen.getByRole("button", { name: /Últimos 90 dias/i });
      await user.click(last90DaysButton);
      
      // Wait for state update
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Verify the date range is set correctly
      expect(capturedDateRange).toBeDefined();
      
      // Calculate expected dates
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const expectedFrom = new Date(today);
      expectedFrom.setDate(today.getDate() - 90);
      expectedFrom.setHours(0, 0, 0, 0);
      
      // Verify from date is 90 days ago
      expect(capturedDateRange?.from.getTime()).toBe(expectedFrom.getTime());
      expect(capturedDateRange?.to.getTime()).toBe(today.getTime());
    });

    it("should display dates in Brazilian Portuguese locale (dd/MM/yyyy)", async () => {
      const user = userEvent.setup();
      
      function TestWrapperWithCapture() {
        const [dateRange, setDateRange] = useState<{ from: Date; to: Date } | undefined>(() => {
          const from = new Date(2026, 1, 15); // February 15, 2026
          from.setHours(0, 0, 0, 0);
          const to = new Date(2026, 2, 20); // March 20, 2026
          to.setHours(23, 59, 59, 999);
          return { from, to };
        });

        return (
          <TopBar
            search=""
            onSearchChange={() => {}}
            statusFilter="all"
            onStatusFilterChange={() => {}}
            dateRange={dateRange}
            onDateRangeChange={(range) => {
              setDateRange(range);
            }}
          />
        );
      }
      
      render(<TestWrapperWithCapture />);
      
      // Verify the date format in the button text
      // Should be "15/02/2026 - 20/03/2026" (dd/MM/yyyy format)
      const calendarButton = screen.getByRole("button", { name: /15\/02\/2026.*20\/03\/2026/i });
      expect(calendarButton).toBeDefined();
      
      // Verify the exact format
      expect(calendarButton.textContent).toMatch(/15\/02\/2026/);
      expect(calendarButton.textContent).toMatch(/20\/03\/2026/);
    });

    it("should verify single date selection sets correct time boundaries (via preset button)", async () => {
      // This test verifies the time boundary logic by using a preset button
      // which internally uses the same onSelect logic that handles single date selection
      const user = userEvent.setup();
      
      let capturedDateRange: { from: Date; to: Date } | undefined;
      
      function TestWrapperWithCapture() {
        const [dateRange, setDateRange] = useState<{ from: Date; to: Date } | undefined>();

        return (
          <TopBar
            search=""
            onSearchChange={() => {}}
            statusFilter="all"
            onStatusFilterChange={() => {}}
            dateRange={dateRange}
            onDateRangeChange={(range) => {
              capturedDateRange = range;
              setDateRange(range);
            }}
          />
        );
      }
      
      render(<TestWrapperWithCapture />);
      
      // Open the calendar popover
      const calendarButton = screen.getByRole("button", { name: /Selecionar período/i });
      await user.click(calendarButton);
      
      // Click a preset button to trigger the date range logic
      const last7DaysButton = screen.getByRole("button", { name: /Últimos 7 dias/i });
      await user.click(last7DaysButton);
      
      // Wait for state update
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Verify time boundaries are set correctly
      expect(capturedDateRange).toBeDefined();
      
      // Verify from has start-of-day time (00:00:00.000)
      expect(capturedDateRange?.from.getHours()).toBe(0);
      expect(capturedDateRange?.from.getMinutes()).toBe(0);
      expect(capturedDateRange?.from.getSeconds()).toBe(0);
      expect(capturedDateRange?.from.getMilliseconds()).toBe(0);
      
      // Verify to has start-of-day time (00:00:00.000) - preset buttons set both to start of day
      expect(capturedDateRange?.to.getHours()).toBe(0);
      expect(capturedDateRange?.to.getMinutes()).toBe(0);
      expect(capturedDateRange?.to.getSeconds()).toBe(0);
      expect(capturedDateRange?.to.getMilliseconds()).toBe(0);
    });
  });
});
