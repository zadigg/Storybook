# Interactive Storybook Creator

A modern web application for creating multi-panel stories with AI-generated images using Google's Gemini 2.5 Flash Image API.

## Features

- 🎨 **AI Image Generation**: Generate consistent character images using Gemini 2.5 Flash
- 📖 **Multi-Panel Stories**: Create and arrange story panels with drag-and-drop
- 🎭 **Character Consistency**: Maintain character appearance across panels
- ✏️ **Scene Editing**: Edit scenes with natural language instructions
- 🔄 **Undo/Redo**: Full history management for all changes
- 🎤 **Speech-to-Text**: Voice input for story creation
- 📄 **PDF Export**: Export your complete storybook as PDF
- 📱 **Responsive Design**: Works on desktop and mobile devices

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **AI Integration**: Google Gemini 2.5 Flash Image API
- **State Management**: React Context + useReducer
- **Drag & Drop**: react-beautiful-dnd
- **PDF Generation**: jsPDF + html2canvas

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Google AI Studio API key

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd interactive-storybook-creator
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env.local
   ```
   
   Edit `.env.local` and add your Gemini API key:
   ```
   NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_api_key_here
   ```

4. **Get your API key**
   - Visit [Google AI Studio](https://aistudio.google.com)
   - Sign in with your Google account
   - Navigate to "Get API key" and create a new key
   - Enable billing on your Google Cloud project

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Usage

### Creating Your First Story

1. **Start with a Panel**: Click "Add Panel" to create your first story panel
2. **Describe the Scene**: Use natural language to describe what should happen
3. **Define Characters**: Add character descriptions for consistency
4. **Generate Images**: Let AI create images based on your descriptions
5. **Arrange Panels**: Drag and drop to reorder your story
6. **Edit & Refine**: Update panels with new instructions
7. **Export**: Download your complete storybook as PDF

### Tips for Better Results

- **Be Specific**: Detailed descriptions lead to better images
- **Maintain Consistency**: Use character descriptions to keep characters consistent
- **Use Scene Context**: Describe lighting, mood, and atmosphere
- **Iterate**: Regenerate images until you're satisfied
- **Voice Input**: Use the microphone for natural storytelling

## API Integration

The app integrates with Google's Gemini 2.5 Flash Image API for:

- **Image Generation**: Creating story panel illustrations
- **Character Descriptions**: Generating consistent character details
- **Prompt Enhancement**: Improving user prompts for better results

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add your environment variables in Vercel dashboard
4. Deploy automatically

### Other Platforms

The app can be deployed to any platform that supports Next.js:
- Netlify
- AWS Amplify
- Railway
- Heroku

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is part of the Nano Banana Hackathon.

## Support

For issues and questions:
- Check the [Issues](https://github.com/your-repo/issues) page
- Create a new issue with detailed description
- Include steps to reproduce any bugs

---

Built with ❤️ for the Nano Banana Hackathon
