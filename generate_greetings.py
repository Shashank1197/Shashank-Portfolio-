import asyncio
import os
import edge_tts

VOICE = "en-US-GuyNeural"
OUTPUT_DIR = "assets/audio"

GREETINGS = [
    (
        "greeting-1.mp3",
        "Welcome to my portfolio! I am delighted you stopped by. Feel free to explore my AI and web engineering projects!"
    ),
    (
        "greeting-2.mp3",
        "Interested in AI? Check out my FastSAM segmentation models and local LLM agents in the Projects section!"
    ),
    (
        "greeting-3.mp3",
        "Try out the AI Terminal below! Type help, skills, or test simulated real-time assistant responses!"
    ),
    (
        "greeting-4.mp3",
        "Currently available for full-time software engineering roles and high-impact internships! Let's connect!"
    )
]

async def main():
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    for filename, text in GREETINGS:
        path = os.path.join(OUTPUT_DIR, filename)
        print(f"Generating {path}...")
        communicate = edge_tts.Communicate(text, VOICE)
        await communicate.save(path)
        print(f"Done: {path} ({os.path.getsize(path)} bytes)")

if __name__ == "__main__":
    asyncio.run(main())
