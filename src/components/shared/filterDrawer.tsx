"use client"

import React, { useState, useTransition } from "react"
import { X, ChevronDown, Loader2 } from "lucide-react"
import { useQueryState } from "@/hooks/useQueryState"
import useDrawerStore from "@/hooks/useDrawerStore"
import { usePathname } from "next/navigation"
import nProgress from "nprogress"
import { FilterData } from "@/types/filter"
import { useFilterStore } from "@/hooks/useFilterDataStore"

const FilterDrawer: React.FC = () => {
  const { filterbar, close } = useDrawerStore()
  const {filters: filterData} = useFilterStore()

  // const [inStock, setInStock] = useQueryState("inStock", false)
  const [colors, setColors, clearColors] = useQueryState("color", true)
  const [styles, setStyles, clearStyles] = useQueryState("style", true)
  const [collections, setCollections, clearCollections] = useQueryState("collection", true)
  const [sizes, setSizes, clearSizes] = useQueryState("sizes", true)

  const [expandedSection, setExpandedSection] = useState<string | null>(null)
  const [loadingKey, setLoadingKey] = useState<string | null>(null)

  const [isPending, startTransition] = useTransition()

  const pathname = usePathname()
  const segments = pathname.split("/").filter(Boolean)
  const secondLast = segments[segments.length - 2] as FilterData["key"] | undefined
  const hiddenKey: FilterData["key"] | null =
    secondLast && (["color", "style", "collection", "size"] as const).includes(secondLast)
      ? (secondLast as FilterData["key"])
      : null

  const selectedValues = {
    color: colors || [],
    style: styles || [],
    collection: collections || [],
    size: sizes || []
  }
  const updateQuery = (key: FilterData["key"], value: string) => {
    nProgress.start()
    const setter =
      key === "color" ? setColors :
        key === "style" ? setStyles :
          key === "collection" ? setCollections :
            key === "size" ? setSizes :
              () => { }

    const id = `${key}-${value}`
    setLoadingKey(id)

    startTransition(() => {
      setter(value)
      setLoadingKey(null)
    })
  }


  const toggleSection = (key: string) => {
    setExpandedSection(prev => (prev === key ? null : key))
  }

  return (
    <div>
      <div
        className={`fixed inset-0 bg-black/30 z-[45] transition-opacity duration-300 ${filterbar ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
          }`}
        style={{ touchAction: 'none' }}
        onClick={(e) => {
          e.stopPropagation();
          close("filterbar");
        }}
      />

      <div
        className={`fixed top-0 right-0 h-full w-full md:max-w-sm bg-white text-black shadow-xl z-[55] transform transition-transform duration-300 ${filterbar ? "translate-x-0" : "translate-x-full"
          }`}
      >
        <div className="flex items-center justify-end p-5 border-b border-gray-400 relative">
          <button
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              close("filterbar");
            }}
            className="absolute top-2 left-2 cursor-pointer"
          >
            <X className="size-6" />
          </button>
          <h2 className="text-base font-medium tracking-wider uppercase">Filter By</h2>
        </div>

        <div className="flex-1 flex flex-col py-4">
          <div className="overflow-y-auto">
            {/* In Stock */}
            {/* <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <span className="text-base font-medium text-gray-900">In Stock</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={inStock === "true"}
                  disabled={isPending}
                  onChange={e => {
                    setLoadingKey("inStock")
                    startTransition(() => {
                      setInStock(e.target.checked ? "true" : "false")
                      setLoadingKey(null)
                    })
                  }}
                />
                <div className="w-12 h-7 bg-gray-200 peer-checked:bg-black rounded-full relative after:absolute after:top-[2px] after:left-[2px] after:w-6 after:h-6 after:bg-white after:rounded-full after:border after:border-gray-300 after:transition-all peer-checked:after:translate-x-5"></div>
              </label>
            </div> */}

            {/* Filter Sections */}
            {filterData
              .filter(section => section.key !== hiddenKey)
              .map(section => {
                const isExpanded = expandedSection === section.key
                const selectedCount =
                  selectedValues[section.key as keyof typeof selectedValues].length
                const clearer =
                  section.key === "color" ? clearColors :
                    section.key === "style" ? clearStyles :
                      section.key === "collection" ? clearCollections :
                        clearSizes
                return (
                  <div key={section.key} className="border-b border-gray-100 last:border-b-0">
                    <div className="flex items-center justify-between ">
                      <button
                        onClick={() => toggleSection(section.key)}
                        className="flex-1 p-4 cursor-pointer flex items-center justify-between hover:bg-gray-50 transition-all duration-200"
                        disabled={isPending}
                      >
                        <div className="flex items-center">
                          <span className="text-base font-medium text-gray-900 tracking-wide">
                            {section.title}
                          </span>
                          {selectedCount > 0 && (
                            <span className="bg-black ml-4 text-white text-xs px-2 py-1 rounded-full font-medium min-w-[1.5rem] text-center">
                              {selectedCount}
                            </span>
                          )}
                        </div>
                        <ChevronDown
                          className={`w-4 h-4 text-gray-500 transition-transform duration-300 ${isExpanded ? "rotate-180" : ""
                            }`}
                        />
                      </button>
                      {selectedCount > 0 && (
                        <button
                          onClick={() => {
                            const id = `${section.key}-clear`
                            setLoadingKey(id)
                            startTransition(() => {
                              clearer()
                              setLoadingKey(null)
                            })
                          }}
                          disabled={isPending}
                          className=" text-gray-400 hover:text-red-500 disabled:opacity-50 m-4 cursor-pointer"
                        >
                          {loadingKey === `${section.key}-clear` && isPending ? (
                            <Loader2 className="size-5 animate-spin" />
                          ) : (
                            <X className="size-5" />
                          )}
                        </button>
                      )}
                    </div>

                    <div
                      className={`overflow-auto transition-all duration-300 ease-out ${isExpanded ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                        }`}
                    >
                      <div className="px-5 py-4 space-y-3">
                        {section.options.map(opt => {
                          const keyId = `${section.key}-${opt.value}`
                          const isLoading = loadingKey === keyId && isPending
                          const isChecked = selectedValues[
                            section.key as keyof typeof selectedValues
                          ].includes(opt.value)

                          return (
                            <label
                              key={opt.value}
                              className="flex items-center justify-between cursor-pointer py-1"
                            >
                              <div className="flex items-center space-x-3">
                                {isLoading ? (
                                  <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />
                                ) : (
                                  <input
                                    type="checkbox"
                                    disabled={isPending}
                                    className="w-5 h-5 border-2 border-gray-300 rounded checked:bg-black checked:border-black transition"
                                    checked={isChecked}
                                    onChange={() => updateQuery(section.key, opt.value)}
                                  />
                                )}
                                <span className="text-sm text-gray-700 font-medium">
                                  {opt.label}
                                </span>
                              </div>
                              {opt.count && (
                                <span className="text-xs text-gray-400 font-medium">
                                  ({opt.count})
                                </span>
                              )}
                            </label>
                          )
                        })}
                      </div>
                    </div>
                  </div>
                )
              })}
          </div>
        </div>
      </div>
    </div>
  )
}

export default FilterDrawer
