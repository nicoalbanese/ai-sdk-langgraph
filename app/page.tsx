"use client";

import { useChat } from "@ai-sdk/react";

export default function Chat() {
  const { messages, input, handleInputChange, handleSubmit, error } = useChat();
  if (error) return <div>{error.message}</div>;

  return (
    <div className="flex flex-col w-full max-w-md py-24 mx-auto stretch">
      <pre>{JSON.stringify(messages, null, 2)}</pre>
      <div className="space-y-4">
        {messages.map((m) =>
          m.parts.map((p, i) => {
            switch (p.type) {
              case "text":
                return (
                  <div key={i} className="whitespace-pre-wrap">
                    <div>
                      <div className="font-bold">{m.role}</div>
                      <p>{p.text}</p>
                    </div>
                  </div>
                );
              default:
                return null;
            }
          }),
        )}
      </div>

      <form onSubmit={handleSubmit}>
        <input
          className="fixed bottom-0 w-full max-w-md p-2 mb-8 border border-gray-300 rounded shadow-xl"
          value={input}
          placeholder="Say something..."
          onChange={handleInputChange}
        />
      </form>
    </div>
  );
}
