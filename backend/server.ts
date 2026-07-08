import express from 'express';
import cors from 'cors';
import multer from 'multer';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const upload = multer({ storage: multer.memoryStorage() });
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

const systemInstruction = `
You are a precise data extraction assistant for GrowEasy CRM.
Your task is to analyze an array of raw objects from a spreadsheet and map their keys into the strict GrowEasy CRM schema.

Rules:
1. crm_status: Must strictly be one of: [GOOD_LEAD_FOLLOW_UP, DID_NOT_CONNECT, BAD_LEAD, SALE_DONE].
2. data_source: Must strictly be one of: [leads_on_demand, meridian_tower, eden_park, varah_swamy, sarjapur_plots]. If none match, use "".
3. Date Format: Convert any creation date to an ISO string or a format parseable by JS new Date().
4. Fallback: Put unmapped crucial details or extra text columns into crm_note.
5. Skip: If an object contains neither an email nor a mobile number, skip it completely.

Return a valid JSON array matching this exact schema:
Array<{
  created_at: string;
  name: string;
  email: string;
  country_code: string;
  mobile_without_country_code: string;
  company: string;
  city: string;
  state: string;
  country: string;
  lead_owner: string;
  crm_status: string;
  crm_note: string;
  data_source: string;
}>
`;

app.post('/api/import-leads', async (req, res) => {
  try {
    const rawRecords = JSON.parse(req.body.rawData);
    const batchSize = 15;
    let successfullyParsed: any[] = [];
    let totalSkipped = 0;

    for (let i = 0; i < rawRecords.length; i += batchSize) {
      const batch = rawRecords.slice(i, i + batchSize);
      
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Process this batch: ${JSON.stringify(batch)}`,
        config: {
          systemInstruction: systemInstruction,
          responseMimeType: "application/json",
        }
      });

      const parsedBatch = JSON.parse(response.text || "[]");
      successfullyParsed = [...successfullyParsed, ...parsedBatch];
      totalSkipped += (batch.length - parsedBatch.length);
    }

    res.json({
      success: true,
      data: successfullyParsed,
      summary: { totalImported: successfullyParsed.length, totalSkipped: totalSkipped >= 0 ? totalSkipped : 0 }
    });

  } catch (error: any) {
    res.status(500).json({ error: 'AI processing failed.', details: error.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Backend running on port ${PORT}`));