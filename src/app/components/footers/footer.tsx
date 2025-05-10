"use client"

import SecondaryCard from "@/app/components/cards/secondary_card";


export default function Footer() {
  return (
    <div className="mt-8 px-4 pb-6">
      <SecondaryCard className="p-6 text-sm text-gray-700">
        <div className="flex flex-col items-center gap-2 text-center">
          <div className="flex flex-wrap gap-4 justify-center text-blue-600 underline">
            <a href="#">Contact</a>
            <a href="#">Terms of Service</a>
            <a href="#">Credits</a>
            <a href="#">Privacy Settings</a>
          </div>
          <p className="text-xs text-gray-600">
            The owner of this site is not responsible for any user generated content (questions, messages, usernames)
          </p>
        </div>
      </SecondaryCard>
    </div>
  );
}
