// Vercel serverless function for study guide generation
export default function handler(req, res) {
  // Redirect to main server endpoint
  return res.status(308).redirect(`${process.env.MAIN_SERVER_URL}/api/generate-study-guide`);
}