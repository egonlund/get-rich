"use client"
import { Bar, BarChart, CartesianGrid, Cell, LabelList, XAxis } from "recharts"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
} from "@/components/ui/chart"
import { Salary } from "@/types/Salary"

const chartConfig = { 
} satisfies ChartConfig

interface Props {
  option: string;
  salaries: Salary[] | undefined;
}

const CURRENT_YEAR = new Date().getFullYear();

export function ChartComponent({ option, salaries }: Props) {
  return (
    <Card className="border-8 border-purple-900 rounded-lg">
      <CardHeader>
        <CardTitle className="text-lg"><span className="text-purple-700 font-bold">{option}</span> – Keskmine brutokuupalk tegevusala järgi</CardTitle>
        <CardDescription><q>Mina näen numbreid, mida teised ei näe - siin on Sinu minevik ja tulevik</q></CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <BarChart
            accessibilityLayer
            data={salaries}
            margin={{
              top: 10,
            }}>
            <CartesianGrid vertical={true} />
            <XAxis
              dataKey="year"
              tickLine={true}
              tickMargin={3}
              axisLine={true}
              fontSize={21}
            />
            <Bar dataKey="value" radius={8}>
              {salaries && salaries.map((entry, index) => {
                const isFutureOrCurrent: boolean =
                  parseInt(entry.year) >= CURRENT_YEAR;
                return (
                  <Cell
                    key={`cell-${index}`}
                    fill={
                      isFutureOrCurrent
                        ? "hsl(var(--chart-2))"
                        : "hsl(var(--chart-1))"
                    }
                  />
                );
              })}
              <LabelList
                position="top"
                className="fill-foreground"
                fontSize={18}
              />
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="font-medium leading-none">
          Palga Oraakel Paavo Garantii
        </div>
      </CardFooter>
    </Card>
  )
}