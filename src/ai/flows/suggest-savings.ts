'use server';

/**
 * @fileOverview Este arquivo define um fluxo Genkit para sugerir possíveis economias de energia.
 *
 * - suggestSavings - Uma função que sugere economia de energia com base no uso do aparelho.
 * - SuggestSavingsInput - O tipo de entrada para a função suggestSavings.
 * - SuggestSavingsOutput - O tipo de retorno para a função suggestSavings.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const SuggestSavingsInputSchema = z.object({
  applianceName: z.string().describe('O nome do aparelho.'),
  power: z.number().describe('O consumo de energia do aparelho em watts.'),
  dailyUsageHours: z.number().describe('O uso médio diário do aparelho em horas.'),
  costPerKWh: z.number().describe('O custo por kWh em R$.'),
});
export type SuggestSavingsInput = z.infer<typeof SuggestSavingsInputSchema>;

const SuggestSavingsOutputSchema = z.object({
  suggestion: z
    .string()
    .describe('Uma sugestão para economia de energia potencial, incluindo a economia de custos estimada em R$.'),
  applicable: z.boolean().describe('Se a sugestão é aplicável ao caso do usuário.'),
});
export type SuggestSavingsOutput = z.infer<typeof SuggestSavingsOutputSchema>;

export async function suggestSavings(input: SuggestSavingsInput): Promise<SuggestSavingsOutput> {
  return suggestSavingsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestSavingsPrompt',
  input: { schema: SuggestSavingsInputSchema },
  output: { schema: SuggestSavingsOutputSchema },
  prompt: `
    Você é um especialista em eficiência energética. Analise os dados de uso do aparelho fornecidos e sugira possíveis economias de energia em português brasileiro.

    Nome do Aparelho: {{{applianceName}}}
    Consumo de Energia (W): {{{power}}}
    Uso Diário (Horas): {{{dailyUsageHours}}}
    Custo por kWh (R$): {{{costPerKWh}}}

    Sua tarefa é avaliar se reduzir o tempo de uso do aparelho em 1 hora por dia resultaria em uma economia de custos significativa para o usuário.

    Se a economia mensal (considerando 30 dias) for de pelo menos R$1,00, crie uma sugestão clara e acionável.
    A sugestão deve seguir este formato EXATO:
    "Se você usar este aparelho 1 hora a menos por dia, poderá economizar aproximadamente X kWh por mês, o que equivale a cerca de Y reais na sua conta."
    Substitua X pelo cálculo de economia de kWh mensal e Y pelo cálculo de economia em R$ mensal. Arredonde os valores para duas casas decimais.

    Se a economia mensal for inferior a R$1,00, ou se o uso diário já for 1 hora ou menos, considere a sugestão não aplicável.
    Nesse caso, defina 'applicable' como false e 'suggestion' como uma string vazia.

    Caso contrário, defina 'applicable' como true.

    Seja conciso e direto ao ponto.
  `,
});

const suggestSavingsFlow = ai.defineFlow(
  {
    name: 'suggestSavingsFlow',
    inputSchema: SuggestSavingsInputSchema,
    outputSchema: SuggestSavingsOutputSchema,
  },
  async (input) => {
    // Lógica pré-prompt para determinar a aplicabilidade
    const dailySavingsKWh = input.power / 1000; // Economia por reduzir 1h de uso
    const monthlySavingsKWh = dailySavingsKWh * 30;
    const monthlySavingsCost = monthlySavingsKWh * input.costPerKWh;

    if (input.dailyUsageHours <= 1 || monthlySavingsCost < 1) {
      return {
        suggestion: '',
        applicable: false,
      };
    }
    
    // Se for aplicável, chama o LLM para gerar a frase formatada
    const { output } = await prompt(input);
    return output!;
  }
);
