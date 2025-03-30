// "use server";
//
// type SaveInterviewParams = {
//   interviewId: string;
//   userId: string;
//   responses: { question: string; answer: string }[];
// };
//
// import { generateObject } from "ai";
// import { google } from "@ai-sdk/google";
//
// import { db } from "@/firebase/admin";
// import { feedbackSchema } from "@/constants";
//
// export async function createFeedback(params: CreateFeedbackParams) {
//   const { interviewId, userId, transcript, feedbackId } = params;
//
//   try {
//     const formattedTranscript = transcript
//       .map(
//         (sentence: { role: string; content: string }) =>
//           `- ${sentence.role}: ${sentence.content}\n`
//       )
//       .join("");
//
//     const { object } = await generateObject({
//       model: google("gemini-2.0-flash-001", {
//         structuredOutputs: false,
//       }),
//       schema: feedbackSchema,
//       prompt: `
//         You are an AI interviewer analyzing a mock interview. Your task is to evaluate the candidate based on structured categories. Be thorough and detailed in your analysis. Don't be lenient with the candidate. If there are mistakes or areas for improvement, point them out.
//         Transcript:
//         ${formattedTranscript}
//
//         Please score the candidate from 0 to 100 in the following areas. Do not add categories other than the ones provided:
//         - **Communication Skills**: Clarity, articulation, structured responses.
//         - **Technical Knowledge**: Understanding of key concepts for the role.
//         - **Problem-Solving**: Ability to analyze problems and propose solutions.
//         - **Cultural & Role Fit**: Alignment with company values and job role.
//         - **Confidence & Clarity**: Confidence in responses, engagement, and clarity.
//         `,
//       system:
//         "You are a professional interviewer analyzing a mock interview. Your task is to evaluate the candidate based on structured categories",
//     });
//
//     const feedback = {
//       interviewId: interviewId,
//       userId: userId,
//       totalScore: object.totalScore,
//       categoryScores: object.categoryScores,
//       strengths: object.strengths,
//       areasForImprovement: object.areasForImprovement,
//       finalAssessment: object.finalAssessment,
//       createdAt: new Date().toISOString(),
//     };
//
//     let feedbackRef;
//
//     if (feedbackId) {
//       feedbackRef = db.collection("feedback").doc(feedbackId);
//     } else {
//       feedbackRef = db.collection("feedback").doc();
//     }
//
//     await feedbackRef.set(feedback);
//
//     return { success: true, feedbackId: feedbackRef.id };
//   } catch (error) {
//     console.error("Error saving feedback:", error);
//     return { success: false };
//   }
// }
//
// // export async function getInterviewById(id: string): Promise<Interview | null> {
// //   const interview = await db.collection("interviews").doc(id).get();
// //
// //   return interview.data() as Interview | null;
// // }
//
// export async function getInterviewById(id: string): Promise<Interview | null> {
//   try {
//     const docRef = db.collection("interviews").doc(id);
//     const interviewDoc = await docRef.get();
//
//     if (!interviewDoc.exists) {
//       console.log(`No interview found for ID: ${id}`); // 🔹 Debugging
//       return null;
//     }
//
//     console.log("Fetched Interview Data:", interviewDoc.data()); // 🔹 Check Data
//     return interviewDoc.data() as Interview;
//   } catch (error) {
//     console.error("Error fetching interview:", error);
//     return null;
//   }
// }
//
// export async function getFeedbackByInterviewId(
//   params: GetFeedbackByInterviewIdParams
// ): Promise<Feedback | null> {
//   const { interviewId, userId } = params;
//
//   const querySnapshot = await db
//     .collection("feedback")
//     .where("interviewId", "==", interviewId)
//     .where("userId", "==", userId)
//     .limit(1)
//     .get();
//
//   if (querySnapshot.empty) return null;
//
//   const feedbackDoc = querySnapshot.docs[0];
//   return { id: feedbackDoc.id, ...feedbackDoc.data() } as Feedback;
// }
//
// // export async function getLatestInterviews(
// //   params: GetLatestInterviewsParams
// // ): Promise<Interview[] | null> {
// //   const { userId, limit = 20 } = params;
// //
// //   const interviews = await db
// //     .collection("interviews")
// //     .orderBy("createdAt", "desc")
// //     .where("finalized", "==", true)
// //     .where("userId", "!=", userId)
// //     .limit(limit)
// //     .get();
// //
// //   return interviews.docs.map((doc) => ({
// //     id: doc.id,
// //     ...doc.data(),
// //   })) as Interview[];
// // }
//
// // export async function getLatestInterviews(
// //     params: GetLatestInterviewsParams
// // ): Promise<Interview[] | null> {
// //   const { userId, limit = 20 } = params;
// //
// //   try {
// //     const querySnapshot = await db
// //         .collection("interviews")
// //         .orderBy("createdAt", "desc")
// //         .where("finalized", "==", true)
// //         .where("userId", "!=", userId)  // Ensure different user
// //         .limit(limit)
// //         .get();
// //
// //     console.log("🔥 Query Snapshot Size:", querySnapshot.size);  // Debugging
// //
// //     if (querySnapshot.empty) {
// //       console.log("⚠️ No interviews found.");
// //       return null;
// //     }
// //
// //     const interviews = querySnapshot.docs.map((doc) => ({
// //       id: doc.id,
// //       ...doc.data(),
// //     }));
// //
// //     console.log("✅ Fetched Interviews:", interviews.length); // Log count
// //     return interviews as Interview[];
// //   } catch (error) {
// //     console.error("❌ Error fetching interviews:", error);
// //     return null;
// //   }
// // }
//
// export async function getLatestInterviews(
//     params: GetLatestInterviewsParams
// ): Promise<Interview[] | null> {
//   const { userId, limit = 20 } = params;
//
//   try {
//     const querySnapshot = await db
//         .collection("interviews")
//         .where("finalized", "==", true)
//         .orderBy("createdAt", "desc")
//         .limit(limit)
//         .get();
//
//     const allInterviews = querySnapshot.docs.map((doc) => ({
//       id: doc.id,
//       ...doc.data(),
//     })) as Interview[];
//
//     // 🔴 Manually filter out the current user's interviews (Firestore doesn't support `!=` queries)
//     const filteredInterviews = allInterviews.filter(
//         (interview) => interview.userId !== userId
//     );
//
//     console.log("🔥 Total Interviews Found:", allInterviews.length);
//     console.log("✅ Filtered Interviews After User ID Check:", filteredInterviews.length);
//
//     return filteredInterviews;
//   } catch (error) {
//     console.error("❌ Error fetching interviews:", error);
//     return null;
//   }
// }
//
// // export async function getInterviewsByUserId(
// //   userId: string
// // ): Promise<Interview[] | null> {
// //   const interviews = await db
// //     .collection("interviews")
// //     .where("userId", "==", userId)
// //     .orderBy("createdAt", "desc")
// //     .get();
// //
// //   return interviews.docs.map((doc) => ({
// //     id: doc.id,
// //     ...doc.data(),
// //   })) as Interview[];
// // }
//
// export async function getInterviewsByUserId(userId: string): Promise<Interview[] | null> {
//   try {
//     const interviewsRef = db
//         .collection("interviews")
//         .where("userId", "==", userId)
//         .orderBy("createdAt", "desc");
//
//     const querySnapshot = await interviewsRef.get(); // 🔥 Fetch interviews
//
//     console.log("🔥 Fetched Interviews:", querySnapshot.docs.length); // Debugging
//
//     return querySnapshot.docs.map((doc) => ({
//       id: doc.id,
//       ...doc.data(),
//     })) as Interview[];
//   } catch (error) {
//     console.error("Error fetching interviews:", error);
//     return null;
//   }
// }
//
// export async function saveInterviewResult(params: SaveInterviewParams) {
//   const { interviewId, userId, responses } = params;
//
//   console.log("🔥 Saving Interview..."); // Debugging
//   console.log("🆔 Interview ID:", interviewId);
//   console.log("👤 User ID:", userId);
//   console.log("📝 Responses:", responses);
//
//   try {
//     const interviewRef = db.collection("interviews").doc(interviewId);
//
//     await interviewRef.set({
//       userId: userId,
//       responses: responses,
//       finalized: true,
//       completedAt: new Date().toISOString(),
//     });
//
//     console.log("✅ Interview successfully saved in Firestore");
//     return { success: true };
//   } catch (error) {
//     console.error("❌ Error saving interview:", error);
//     return { success: false, error };
//   }
// }

'use server';

import {db} from "@/firebase/admin";
import {generateObject} from "ai";
import { google } from "@ai-sdk/google";
import { feedbackSchema } from "@/constants";

export async function getInterviewsByUserId(userId: string): Promise<Interview[] | null> {
  const interviews = await db
      .collection('interviews')
      .where('userId', '==', userId)
      .orderBy('createdAt', 'desc')
      .get();

  return interviews.docs.map((doc) => ({
    id: doc.id,
    ...doc.data()
  })) as Interview[];
}

export async function getLatestInterviews(params: GetLatestInterviewsParams): Promise<Interview[] | null> {
  const { userId, limit = 20 } = params;

  const interviews = await db
      .collection('interviews')
      .orderBy('createdAt', 'desc')
      .where('finalized', '==', true)
      .where('userId', '!=', userId)
      .limit(limit)
      .get();

  return interviews.docs.map((doc) => ({
    id: doc.id,
    ...doc.data()
  })) as Interview[];
}

export async function getInterviewById(id: string): Promise<Interview | null> {
  const interview = await db
      .collection('interviews')
      .doc(id)
      .get();

  return interview.data() as Interview | null;
}

export async function createFeedback(params: CreateFeedbackParams) {
  const { interviewId, userId, transcript, feedbackId } = params;


  try{
    const formattedTranscript = transcript
        .map((sentence: { role: string; content: string }) => (
          `- ${sentence.role}: ${sentence.content}\n`
        ))
        .join("");

    const { object: { totalScore, categoryScores, strengths, areasForImprovement, finalAssessment} } = await generateObject({
      model: google('gemini-2.0-flash-001', {
        structuredOutputs: false,
      }),
      schema: feedbackSchema,
      prompt: `
         You are an AI interviewer analyzing a mock interview. Your task is to evaluate the candidate based on structured categories. Be thorough and detailed in your analysis. Don't be lenient with the candidate. If there are mistakes or areas for improvement, point them out.
         Transcript:
         ${formattedTranscript}

         Please score the candidate from 0 to 100 in the following areas. Do not add categories other than the ones provided:
         - **Communication Skills**: Clarity, articulation, structured responses.
         - **Technical Knowledge**: Understanding of key concepts for the role.
         - **Problem-Solving**: Ability to analyze problems and propose solutions.
         - **Cultural & Role Fit**: Alignment with company values and job role.
         - **Confidence & Clarity**: Confidence in responses, engagement, and clarity.
         `,
      system:
        "You are a professional interviewer analyzing a mock interview. Your task is to evaluate the candidate based on structured categories",
    });

    const feedback = await db.collection('feedback').add({
      interviewId,
      userId,
      totalScore,
      categoryScores,
      strengths,
      areasForImprovement,
      finalAssessment,
      createdAt: new Date().toISOString()
    })

    return {
      success: true,
      feedbackId: feedback.id
    }
  } catch (e) {
      console.error("Error saving feedback:", e);

      return { success: false };
  }
}

export async function getFeedbackByInterviewId(params: GetFeedbackByInterviewIdParams): Promise<Feedback | null> {
  const { interviewId, userId } = params;

  const feedback = await db
      .collection('feedback')
      .where('interviewId', '==', interviewId)
      .where('userId', '==', userId)
      .limit(1)
      .get();

  if(feedback.empty) return null;

  const feedbackDoc = feedback.docs[0];
  return {
    id: feedbackDoc.id, ...feedbackDoc.data()
  } as Feedback;
}
