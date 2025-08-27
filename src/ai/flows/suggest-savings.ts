'use server';

/**
 * @fileOverview This file defines a Genkit flow for suggesting potential energy savings.
 *
 * - suggestSavings - A function that suggests energy savings based on appliance usage.
 * - SuggestSavingsInput - The input type for the suggestSavings function.
 * - SuggestSavingsOutput - The return type for the suggestSavings function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestSavingsInputSchema = z.object({
  applianceName: z.string().describe('The name of the appliance.'),
  power: z.number().describe('The power consumption of the appliance in watts.'),
  dailyUsageHours: z.number().describe('The average daily usage of the appliance in hours.'),
  costPerKWh: z.number().describe('The cost per kWh in R$.'),
});
export type SuggestSavingsInput = z.infer<typeof SuggestSavingsInputSchema>;

const SuggestSavingsOutputSchema = z.object({
  suggestion: z.string().describe('A suggestion for potential energy savings, including estimated cost savings.'),
  applicable: z.boolean().describe('Whether the suggestion is applicable to the user case.'),
});
export type SuggestSavingsOutput = z.infer<typeof SuggestSavingsOutputSchema>;

export async function suggestSavings(input: SuggestSavingsInput): Promise<SuggestSavingsOutput> {
  return suggestSavingsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestSavingsPrompt',
  input: {schema: SuggestSavingsInputSchema},
  output: {schema: SuggestSavingsOutputSchema},
  prompt: `You are an energy efficiency expert. Analyze the provided appliance usage data and suggest potential energy savings.

  Appliance Name: {{{applianceName}}}
  Power Consumption (W): {{{power}}}
  Daily Usage (Hours): {{{dailyUsageHours}}}
  Cost per kWh (R$): {{{costPerKWh}}}

  Consider whether reducing the usage time would result in significant cost savings for the user.  If a reduction of usage is not relevant (e.g. it's already very low usage), set 'applicable' to false.

  Provide a clear and actionable suggestion for reducing energy consumption, including the estimated cost savings per month if the suggestion is followed. Provide the suggestion in a way that is easily understood by a non-expert. Only suggest reducing the time, as that is the only variable you can change.
  Set 'applicable' to true if the suggestion would lead to a cost savings.

  Be as concise as possible.
  `,
});

const suggestSavingsFlow = ai.defineFlow(
  {
    name: 'suggestSavingsFlow',
    inputSchema: SuggestSavingsInputSchema,
    outputSchema: SuggestSavingsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
