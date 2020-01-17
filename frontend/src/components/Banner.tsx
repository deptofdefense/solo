import React from "react";

interface BannerProps {
  title?: string;
}

const Banner: React.FC<BannerProps> = ({
  title = "System for Operational Logistics Orders (SOLO)"
}) => <h1>{title}</h1>;

export default Banner;
