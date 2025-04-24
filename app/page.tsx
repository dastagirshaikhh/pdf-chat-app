"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GoogleGenerativeAI } from "@google/generative-ai";


const key = process.env.NEXT_PUBLIC_GEMINI_API_KEY!;
const genAI = new GoogleGenerativeAI(key);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

export default function Home() {
  const [inputValue, setInputValue] = useState("");
  const [response, setResponse] = useState("");
  const [file, setFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;
    setFile(selectedFile);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!inputValue && !file) return;

    if (file) {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = reader.result?.toString().split(",")[1]; // remove data:*/*;base64,
        const mimeType = file.type;

        const result = await model.generateContent({
          contents: [
            {
              role: "user",
              parts: [
                ...(inputValue ? [{ text: inputValue }] : []),
                {
                  inlineData: {
                    mimeType,
                    data: base64!,
                  },
                },
              ],
            },
          ],
        });

        setResponse(result.response.text());
      };

      reader.readAsDataURL(file);
    } else {
      const result = await model.generateContent(inputValue);
      setResponse(result.response.text());
    }
  };

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
        <form onSubmit={handleSubmit}>
          <Input
            type="text"
            placeholder="Input"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
          />
          <br />
          <Input type="file" onChange={handleFileChange} />
          <br />
          <Button type="submit">Submit</Button>
        </form>

        {response && (
          <div className="mt-4 p-4 bg-gray-200 rounded-lg text-black max-w-xl">
            <p><strong>AI Response:</strong> {response}</p>
          </div>
        )}
      </main>
      <footer className="row-start-3 flex gap-6 flex-wrap items-center justify-center"></footer>
    </div>
  );
}
