'use server';

import { suggestSavings, type SuggestSavingsInput, type SuggestSavingsOutput } from "@/ai/flows/suggest-savings";

export async function getSavingsSuggestion(input: SuggestSavingsInput): Promise<SuggestSavingsOutput> {
    try {
        const result = await suggestSavings(input);
        return result;
    } catch (error) {
        console.error("Error in suggestSavings flow:", error);
        throw new Error("Failed to get savings suggestion from AI.");
    }
}
