import { GoogleGenerativeAI } from "@google/generative-ai";
const client = new GoogleGenerativeAI(process.env.OPENAI_API_KEY);

export async function isUsefulMemory(text) {
  const prompt = `
    Decide if the following message contains long-term useful personal information.
Reply ONLY with YES or NO.

Message "${text}"`;

  const model = client.getGenerativeModel(prompt);
  const answer = result.response.text().trim().toUppercase();

  return (answer = "YES");
}
