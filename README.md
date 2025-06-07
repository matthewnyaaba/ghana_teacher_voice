# Welcome to Next.js

This is the most minimal starter for your Next.js project.

## Deploy your own

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/vercel/next.js/tree/canary/examples/hello-world&project-name=hello-world&repository-name=hello-world)

## How to use

Execute [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app) with [npm](https://docs.npmjs.com/cli/init), [Yarn](https://yarnpkg.com/lang/en/docs/cli/create/), or [pnpm](https://pnpm.io) to bootstrap the example:

```bash
npx create-next-app --example hello-world hello-world-app
```

```bash
yarn create next-app --example hello-world hello-world-app
```

```bash
pnpm create next-app --example hello-world hello-world-app
```

Deploy it to the cloud with [Vercel](https://vercel.com/new?utm_source=github&utm_medium=readme&utm_campaign=next-example) ([Documentation](https://nextjs.org/docs/deployment)).

# GenAITEd Ghana - AI-Powered Voice Learning Platform 🇬🇭

An AI-powered voice learning platform for Ghana's teacher education system, supporting 47 Colleges of Education and 7 Universities.

## 🚀 Features

- 🎙️ **Voice Conversations** - Natural voice interactions with AI tutors
- 📚 **Curriculum Aligned** - Content tailored to Ghana's B.Ed curriculum
- 🌐 **Multi-Language Support** - English, Twi, Ga, Ewe, and more
- 🔍 **Web Search Integration** - Real-time information retrieval
- 👥 **Role-Based Access** - Student, Teacher, and Admin roles
- 🏫 **Institution Support** - All Ghana education institutions included

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **Voice**: LiveKit WebRTC
- **Backend**: Python FastAPI (deployed on Railway)
- **AI**: OpenAI GPT-4, ElevenLabs TTS
- **Deployment**: Vercel (Frontend), Railway (Backend)

## 📋 Prerequisites

- Node.js 18+ 
- Python backend deployed on Railway
- LiveKit account
- Vercel account for deployment

## 🔧 Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/ghana-education-voice.git
cd ghana-education-voice
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env.local` file:
```env
NEXT_PUBLIC_LIVEKIT_URL=wss://your-livekit-url
NEXT_PUBLIC_API_URL=https://your-railway-backend.up.railway.app
```

4. Run development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000)

## 🚀 Deployment

### Deploy to Vercel

1. Push to GitHub
2. Import project in Vercel
3. Add environment variables:
   - `NEXT_PUBLIC_LIVEKIT_URL`
   - `NEXT_PUBLIC_API_URL`
4. Deploy!

### Backend Requirements

Your Python backend should have these endpoints:
- `POST /token` - Generate LiveKit tokens
- `POST /auth/login` - User authentication
- `POST /auth/register` - User registration

## 🏫 Supported Institutions

### Colleges of Education (47)
- Accra College of Education
- Ada College of Education
- Agogo Presbyterian College of Education
- [... and 44 more]

### Universities (7)
- University of Ghana - Department of Teacher Education
- University of Cape Coast - Faculty of Educational Foundations
- University of Education, Winneba
- [... and 4 more]

## 📱 Features by Role

### Students
- Access AI tutors
- Voice conversations
- Progress tracking
- Study groups

### Teachers
- Create custom AI tutors
- Monitor student progress
- Curriculum resources
- Analytics dashboard

### Administrators
- Institution management
- User management
- System analytics
- Content moderation

## 🔐 Security

- JWT-based authentication
- Secure token generation
- CORS configuration
- Environment variable protection

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- Ghana Education Service
- All participating Colleges of Education
- University partners
- LiveKit for voice infrastructure
- OpenAI for AI capabilities

---

Built with ❤️ for Ghana's educators and students
