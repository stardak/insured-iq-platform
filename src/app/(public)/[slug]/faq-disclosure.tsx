"use client";

import { Disclosure, DisclosureButton, DisclosurePanel } from "@headlessui/react";
import { MinusSmallIcon, PlusSmallIcon } from "@heroicons/react/24/outline";

interface FaqItem {
  question: string;
  answer: string;
}

export default function FaqDisclosure({
  items,
  dark = false,
}: {
  items: FaqItem[];
  dark?: boolean;
}) {
  return (
    <dl
      className={`mt-16 divide-y ${
        dark ? "divide-white/10" : "divide-gray-900/10"
      }`}
    >
      {items.map((faq) => (
        <Disclosure
          key={faq.question}
          as="div"
          className="py-6 first:pt-0 last:pb-0"
        >
          <dt>
            <DisclosureButton
              className={`group flex w-full items-start justify-between text-left ${
                dark ? "text-white" : "text-gray-900"
              }`}
            >
              <span className="text-base/7 font-semibold">{faq.question}</span>
              <span className="ml-6 flex h-7 items-center">
                <PlusSmallIcon
                  aria-hidden="true"
                  className={`size-6 group-data-[open]:hidden ${
                    dark ? "text-gray-400" : ""
                  }`}
                />
                <MinusSmallIcon
                  aria-hidden="true"
                  className={`size-6 [.group:not([data-open])_&]:hidden ${
                    dark ? "text-gray-400" : ""
                  }`}
                />
              </span>
            </DisclosureButton>
          </dt>
          <DisclosurePanel as="dd" className="mt-2 pr-12">
            <p
              className={`text-base/7 ${
                dark ? "text-gray-400" : "text-gray-600"
              }`}
            >
              {faq.answer}
            </p>
          </DisclosurePanel>
        </Disclosure>
      ))}
    </dl>
  );
}
