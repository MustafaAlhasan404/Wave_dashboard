// This is a Server Component
import React from "react";
import { Metadata } from "next";

type Props = {
  params: { id: string };
};

export function generateMetadata({ params }: Props): Metadata {
  return {
    title: `News Post ${params.id}`,
  };
}

export default function NewsPostPage({ params }: Props) {
  return (
    <div>
      <h1>News Post Page: {params.id}</h1>
      <p>This page is being rebuilt to fix type issues.</p>
    </div>
  );
} 