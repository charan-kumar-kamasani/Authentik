import React from "react";

interface ResultCardProps {
  color: string;
  icon: string;
  title: React.ReactNode;
  buttonText: string;
  children: React.ReactNode;
  iconSize?: string;
  onButtonClick?: () => void;
  imageContainerClassName?: string;
}

const ResultCard: React.FC<ResultCardProps> = ({
  color,
  icon,
  title,
  buttonText,
  children,
  iconSize = "w-40 h-40",
  onButtonClick,
  imageContainerClassName = "",
}) => {
  console.log(`bg-${color}`);
  return (
    <div className="w-full h-full flex flex-col items-center">
      {/* Card Container */}
      <div className="w-full rounded-[24px] overflow-hidden mb-24">
        {/* Top Section: Stamp (White BG) */}
        <div
          className="flex flex-col items-center justify-center min-h-[160px] rounded-b-[24px] shadow-lg mb-6"
          style={{ backgroundColor: color }}
        >
          <div className="flex justify-center items-center bg-white w-full rounded-b-[24px] shadow-lg">
            <img
              src={icon}
              alt="Status"
              className={`object-contain ${iconSize}`}
            />
          </div>
          <div className="py-2 text-center w-full relative z-10">
            <div className="text-white font-bold text-[22px] tracking-wide">
              {title}
            </div>
          </div>
        </div>

        {/* Bottom Section: Details */}
        <div className="px-6 pb-8 text-white">{children}</div>
      </div>

      {/* Fixed Button */}
      <div className="fixed bottom-8 left-0 right-0 px-6 z-20">
        <button
          onClick={onButtonClick}
          className="w-full bg-white font-bold text-[20px] py-3.5 rounded-[30px] shadow-xl active:scale-[0.98] transition-transform border border-transparent"
          style={{ color: color }}
        >
          {buttonText}
        </button>
      </div>
    </div>
  );
};

export default ResultCard;
