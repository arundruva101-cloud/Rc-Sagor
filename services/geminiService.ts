import { GoogleGenAI, Type } from "@google/genai";
import { Movie } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const movieSchema = {
  type: Type.OBJECT,
  properties: {
    title: {
      type: Type.STRING,
      description: "The official title of the movie."
    },
    releaseDate: {
      type: Type.STRING,
      description: "The exact theatrical release date in YYYY-MM-DD format."
    },
    posterUrl: {
      type: Type.STRING,
      description: "A publicly accessible URL to a high-quality movie poster image. If the user provided the poster, this can be an empty string."
    },
    genres: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "A list of genres associated with the movie."
    },
    cast: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "A list of the main cast members."
    }
  },
  required: ["title", "releaseDate", "posterUrl", "genres", "cast"]
};

export const identifyMovieFromPoster = async (base64Image: string, mimeType: string): Promise<Movie> => {
  try {
    const imagePart = {
      inlineData: {
        data: base64Image,
        mimeType: mimeType,
      },
    };

    const textPart = {
      text: "From the provided movie poster, identify the movie. Extract the following information: the full movie title, the theatrical release date in YYYY-MM-DD format, a list of its primary genres, and a list of the main cast members. For the posterUrl, you can leave it as an empty string.",
    };

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: { parts: [imagePart, textPart] },
      config: {
        responseMimeType: "application/json",
        responseSchema: movieSchema,
      },
    });

    const jsonText = response.text.trim();
    return JSON.parse(jsonText);
  } catch (error) {
    console.error("Error identifying movie from poster:", error);
    throw new Error("Failed to identify movie from the provided poster. Please try a different image.");
  }
};