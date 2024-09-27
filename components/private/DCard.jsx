import { ArrowRight, MoveUpRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React from "react";

const DCard = ({ image, lNmae, url }) => {
  return (
    <div class="wrapper md:max-w-96 md:max-h-96 antialiased text-gray-900 rounded-lg">
      <div>
        <Image
          src={image}
          alt=" random imgee"
          width={1000}
          height={1000}
          class="w-full object-cover object-center rounded-lg shadow-md"
        />

        <div class="relative px-4 -mt-16">
          <div class="bg-white p-6 rounded-lg shadow-lg">
            <Link href={url} className="flex items-center justify-between">
              <h4 class="mt-1 text-xl font-semibold uppercase leading-tight truncate">
                {lNmae}
              </h4>

              <ArrowRight className="h-6 w-6 text-accent" />
            </Link>

            <div class="mt-1">Manage your {lNmae} here</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DCard;
