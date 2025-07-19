"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendEmail = void 0;
// src/utils/emailSender.ts
const resend_1 = require("resend");
const resend = new resend_1.Resend("re_SRVfv4TF_NV27uCztF5hquhDQpUgbe38F");
const sendEmail = async ({ to, subject, html }) => {
    try {
        const { data, error } = await resend.emails.send({
            from: "Your App Name <onboarding@resend.dev>", // Or your verified sender
            to: [to],
            subject,
            html,
        });
        if (error) {
            console.error("Error sending email with Resend:", error);
            throw new Error("Email failed to send");
        }
        console.log(`Email sent to ${to}`, data);
    }
    catch (err) {
        console.error("Unexpected error:", err);
        throw err;
    }
};
exports.sendEmail = sendEmail;
