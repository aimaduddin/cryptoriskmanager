"use client";

import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type FormState = {
  balance: string;
  riskPercent: string;
  entryPrice: string;
  stopLoss: string;
  takeProfit: string;
};

const defaultForm: FormState = {
  balance: "220",
  riskPercent: "2",
  entryPrice: "15.60",
  stopLoss: "15.40",
  takeProfit: "",
};

type Metric = {
  label: string;
  value: string;
  helper?: string;
};

const numberFormatter = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const integerFormatter = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 0,
});

const leverageFormatter = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

export default function Home() {
  const [form, setForm] = useState<FormState>(defaultForm);

  const numbers = useMemo(() => {
    const balance = parseFloat(form.balance) || 0;
    const riskPercent = parseFloat(form.riskPercent) || 0;
    const entryPrice = parseFloat(form.entryPrice) || 0;
    const stopLoss = parseFloat(form.stopLoss) || 0;
    const takeProfit = parseFloat(form.takeProfit);

    const riskAmount = balance * (riskPercent / 100);
    const riskPerCoin = Math.abs(entryPrice - stopLoss);
    const positionSize = riskPerCoin > 0 ? riskAmount / riskPerCoin : 0;
    const capitalUsed = positionSize * entryPrice;
    const capitalGap = Math.max(0, capitalUsed - balance);
    const requiredLeverage =
      balance > 0 && capitalUsed > 0 ? capitalUsed / balance : null;

    const rewardPerCoin = Number.isFinite(takeProfit)
      ? Math.abs(takeProfit - entryPrice)
      : null;
    const rrRatio =
      rewardPerCoin !== null && riskPerCoin > 0 && rewardPerCoin > 0
        ? rewardPerCoin / riskPerCoin
        : null;

    const direction =
      entryPrice === 0 || stopLoss === 0
        ? null
        : stopLoss < entryPrice
        ? "Long"
        : stopLoss > entryPrice
        ? "Short"
        : null;

    const warnings = {
      emptyFields: !form.entryPrice || !form.stopLoss,
      zeroRisk: riskPerCoin === 0,
      zeroBalance: balance === 0,
    };

    return {
      balance,
      riskPercent,
      entryPrice,
      stopLoss,
      takeProfit,
      riskAmount,
      riskPerCoin,
      positionSize,
      capitalUsed,
      capitalGap,
      requiredLeverage,
      rewardPerCoin,
      rrRatio,
      direction,
      warnings,
    };
  }, [form]);

  const capitalRequirementValue =
    numbers.capitalUsed === 0
      ? "Awaiting inputs"
      : numbers.balance === 0
      ? "Add balance"
      : numbers.requiredLeverage !== null && numbers.requiredLeverage > 1
      ? `${leverageFormatter.format(numbers.requiredLeverage)}x leverage`
      : "No leverage needed";

  const capitalRequirementHelper =
    numbers.capitalUsed === 0
      ? "Fill in entry and stop to calculate capital"
      : numbers.balance === 0
      ? "Enter account balance to estimate leverage"
      : numbers.requiredLeverage !== null && numbers.requiredLeverage > 1
      ? `Short by $${numberFormatter.format(numbers.capitalGap)} from balance`
      : "Covered by account balance";

  const outputMetrics: Metric[] = [
    {
      label: "Risk Amount",
      value: `$${numberFormatter.format(numbers.riskAmount)}`,
      helper: `${numberFormatter.format(numbers.riskPercent)}% of account`,
    },
    {
      label: "Risk per Coin",
      value: `$${numberFormatter.format(numbers.riskPerCoin)}`,
      helper: numbers.direction ? `${numbers.direction} bias` : undefined,
    },
    {
      label: "Position Size",
      value: `${numberFormatter.format(numbers.positionSize)}`,
      helper: `${integerFormatter.format(numbers.positionSize)} units rounded`,
    },
    {
      label: "Order Value",
      value: `$${numberFormatter.format(numbers.capitalUsed)}`,
      helper: "Entry price x position size",
    },
    {
      label: "Capital Requirement",
      value: capitalRequirementValue,
      helper: capitalRequirementHelper,
    },
  ];

  if (numbers.rrRatio !== null) {
    outputMetrics.push({
      label: "Reward : Risk",
      value: `${numberFormatter.format(numbers.rrRatio)} : 1`,
      helper: numbers.rewardPerCoin
        ? `$${numberFormatter.format(numbers.rewardPerCoin)} reward per coin`
        : undefined,
    });
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 text-slate-100">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-4 py-12 sm:px-8">
        <header className="flex flex-col gap-3 text-center sm:text-left">
          <div className="inline-flex items-center gap-2 self-center rounded-full border border-slate-700/60 bg-slate-900/80 px-4 py-1 text-xs font-medium uppercase tracking-wide text-slate-300 sm:self-start">
            Crypto Risk Manager
          </div>
          <h1 className="text-3xl font-semibold sm:text-4xl">
            Position Size Calculator
          </h1>
          <p className="max-w-2xl text-sm text-slate-300 sm:text-base">
            Size every trade around a fixed percentage of your balance so losses
            stay controlled and emotions stay out of the process.
          </p>
        </header>

        <section className="grid gap-4 text-sm text-slate-200 sm:text-base">
          <p>
            <strong>Crypto Risk Manager</strong> calculates how many coins to buy, the order
            value, and whether leverage is needed after you provide balance, risk
            %, entry, and stop-loss levels.
          </p>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-lg border border-white/10 bg-slate-900/60 p-4">
              <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-300">
                Core Principle
              </h2>
              <ul className="mt-3 list-inside list-disc space-y-2 text-slate-300">
                <li>Maximum loss per trade = risk % x account balance (2% of 220 USDT = 4.4 USDT).</li>
                <li>You do not always go all-in; order value depends on stop-loss distance.</li>
                <li>Wider stop loss means a smaller order value.</li>
                <li>Tighter stop loss means a larger order value (may require leverage).</li>
              </ul>
            </div>
            <div className="rounded-lg border border-white/10 bg-slate-900/60 p-4">
              <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-300">
                Formulas Used
              </h2>
              <ol className="mt-3 space-y-2 list-decimal pl-5 text-slate-300">
                <li>Risk Amount = Balance x Risk %</li>
                <li>Risk per Coin = |Entry - Stop|</li>
                <li>Position Size = Risk Amount / Risk per Coin</li>
                <li>Order Value = Position Size x Entry</li>
              </ol>
            </div>
          </div>
          <div className="rounded-lg border border-emerald-500/40 bg-emerald-500/10 p-4 text-slate-100">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-emerald-200">
              Example
            </h2>
            <p className="mt-3">
              Balance 220 USDT | Risk 2% = 4.4 USDT | Entry 15.60 | Stop 14.80 (~5%).
            </p>
            <p className="mt-2">
              Position Size = 4.4 / 0.80 = 5.5 coins | Order Value = 5.5 x 15.60 = 85.8 USDT.
            </p>
            <p className="mt-2 text-sm text-emerald-200">
              Risk stays capped at 4.4 USDT (2% of the account) even with a wider stop.
            </p>
          </div>
        </section>

        <div className="grid items-start gap-6 lg:grid-cols-[1.15fr_1fr]">
          <Card className="border-transparent bg-white/5 backdrop-blur">
            <CardHeader>
              <CardTitle>Trade Inputs</CardTitle>
              <CardDescription className="text-slate-300">
                Fill in your trade setup. Values update as you type.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <InputField
                  id="balance"
                  label="Account Balance"
                  suffix="USDT"
                  placeholder="220"
                  value={form.balance}
                  onChange={(value) => setForm((prev) => ({ ...prev, balance: value }))}
                />
                <InputField
                  id="risk-percent"
                  label="Risk %"
                  suffix="%"
                  step="0.1"
                  placeholder="2"
                  value={form.riskPercent}
                  onChange={(value) =>
                    setForm((prev) => ({ ...prev, riskPercent: value }))
                  }
                />
                <InputField
                  id="entry-price"
                  label="Entry Price"
                  suffix="USDT"
                  step="0.01"
                  placeholder="15.60"
                  value={form.entryPrice}
                  onChange={(value) =>
                    setForm((prev) => ({ ...prev, entryPrice: value }))
                  }
                />
                <InputField
                  id="stop-loss"
                  label="Stop Loss"
                  suffix="USDT"
                  step="0.01"
                  placeholder="15.40"
                  value={form.stopLoss}
                  onChange={(value) =>
                    setForm((prev) => ({ ...prev, stopLoss: value }))
                  }
                />
                <InputField
                  id="take-profit"
                  label="Take Profit (optional)"
                  suffix="USDT"
                  step="0.01"
                  placeholder="18.00"
                  value={form.takeProfit}
                  onChange={(value) =>
                    setForm((prev) => ({ ...prev, takeProfit: value }))
                  }
                />
              </div>

              <div className="flex flex-wrap gap-3">
                <Button onClick={() => setForm(defaultForm)}>Use example</Button>
                <Button
                  variant="ghost"
                  onClick={() =>
                    setForm({
                      balance: "",
                      riskPercent: "",
                      entryPrice: "",
                      stopLoss: "",
                      takeProfit: "",
                    })
                  }
                >
                  Clear inputs
                </Button>
              </div>

              {numbers.warnings.zeroRisk && !numbers.warnings.emptyFields ? (
                <p className="rounded-md border border-amber-400/50 bg-amber-500/10 px-3 py-2 text-sm text-amber-200">
                  Entry and stop loss are the same. Adjust your stop to calculate
                  risk.
                </p>
              ) : null}
            </CardContent>
          </Card>

          <ResultsPanel metrics={outputMetrics} />
        </div>
      </div>
    </div>
  );
}

type InputFieldProps = {
  id: string;
  label: string;
  suffix: string;
  placeholder?: string;
  step?: string;
  value: string;
  onChange: (value: string) => void;
};

function InputField({
  id,
  label,
  suffix,
  placeholder,
  step,
  value,
  onChange,
}: InputFieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={id}>{label}</Label>
      <div className="relative">
        <Input
          id={id}
          type="number"
          inputMode="decimal"
          step={step}
          placeholder={placeholder}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="pr-16 bg-white/90 text-slate-900 shadow-inner focus-visible:ring-emerald-400 dark:bg-slate-950/80 dark:text-slate-100"
        />
        <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-sm font-medium text-slate-500">
          {suffix}
        </span>
      </div>
    </div>
  );
}

type ResultsPanelProps = {
  metrics: Metric[];
};

function ResultsPanel({ metrics }: ResultsPanelProps) {
  return (
    <Card className="border-transparent bg-white/10 text-slate-100 shadow-lg shadow-slate-950/30 backdrop-blur">
      <CardHeader>
        <CardTitle>Risk Breakdown</CardTitle>
        <CardDescription className="text-slate-300">
          Position sizing details generated from your inputs.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <dl className="space-y-3">
          {metrics.map((metric) => (
            <div
              key={metric.label}
              className="flex items-start justify-between gap-4 rounded-lg border border-white/10 bg-slate-900/40 p-4"
            >
              <div>
                <dt className="text-sm font-medium text-slate-300">
                  {metric.label}
                </dt>
                {metric.helper ? (
                  <p className="mt-1 text-xs text-slate-400">{metric.helper}</p>
                ) : null}
              </div>
              <dd className="text-right text-lg font-semibold text-emerald-300">
                {metric.value}
              </dd>
            </div>
          ))}
        </dl>
        <p className="text-xs text-slate-400">
          Tip: Keep risk per trade consistent (1-2% for most accounts) to avoid
          emotional decisions and stick to your trading plan.
        </p>
      </CardContent>
    </Card>
  );
}
