import React from "react";
import { Layout } from "@/components/layout/Layout";
import { useState, } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
    MapPin,
    Upload,
    ChevronRight,
    Check,
    Globe,

    AlertCircle,
    ArrowLeft,
    Layers,
    Navigation2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
// Transpiler-compatibility helpers
const _nullishCoalesce = (lhs, rhsFn) => lhs != null ? lhs : rhsFn();
const _optionalChain = (ops) => {
  let lastAccessLHS;
  let value = ops[0];
  let i = 1;
  while (i < ops.length) {
    const op = ops[i]; const fn = ops[i + 1]; i += 2;
    if ((op === "optionalAccess" || op === "optionalCall") && value == null) return undefined;
    if (op === "access" || op === "optionalAccess") { lastAccessLHS = value; value = fn(value); }
    else if (op === "call" || op === "optionalCall") { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; }
  }
  return value;
};


export default function AreaManagement() {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        division: "",
        district: "",
        tehsil: "",
    });
    const [isUploading, setIsUploading] = useState(false);
    const [uploadedFile, setUploadedFile] = useState(null);
    const [uploadedGeoData, setUploadedGeoData] = useState(null);
    const { toast } = useToast();

    const handleNext = () => {
        if (step === 1 && (!formData.division || !formData.district || !formData.tehsil)) {
            toast({
                title: "Information Missing",
                description: "Please fill in all area details to proceed.",
                variant: "destructive"
            });
            return;
        }
        setStep(step + 1);
    };

    const handleBack = () => setStep(step - 1);

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const extension = _optionalChain([file, 'access', _ => _.name, 'access', _2 => _2.split, 'call', _3 => _3('.'), 'access', _4 => _4.pop, 'call', _5 => _5(), 'optionalAccess', _6 => _6.toLowerCase, 'call', _7 => _7()]);
            const allowedExtensions = ['zip', 'shp', 'kml', 'kmz', 'json', 'geojson'];

            if (!extension || !allowedExtensions.includes(extension)) {
                toast({
                    title: "Invalid Format",
                    description: "Please upload a valid .shp (zip), .kml, .kmz, or .geojson file.",
                    variant: "destructive"
                });
                return;
            }

            setUploadedFile(file);
            setIsUploading(true);

            // Simulate processing based on format
            setTimeout(() => {
                setIsUploading(false);
                // Get base coordinates based on selection
                const baseCoords = formData.division === "rawalpindi" ? [73.01, 33.56] :
                    formData.division === "gujranwala" ? [74.19, 32.18] :
                        [74.35, 31.52];

                // Mock GeoJSON for the preview (slightly offset polygon)
                setUploadedGeoData({
                    type: "Feature",
                    geometry: {
                        type: "Polygon",
                        coordinates: [[
                            [baseCoords[0] - 0.05, baseCoords[1] - 0.05],
                            [baseCoords[0] + 0.05, baseCoords[1] - 0.05],
                            [baseCoords[0] + 0.05, baseCoords[1] + 0.05],
                            [baseCoords[0] - 0.05, baseCoords[1] + 0.05],
                            [baseCoords[0] - 0.05, baseCoords[1] - 0.05]
                        ]]
                    },
                    properties: {
                        name: formData.tehsil,
                        format: extension.toUpperCase(),
                        timestamp: new Date().toISOString()
                    }
                });
                toast({
                    title: "Success",
                    description: `${extension.toUpperCase()} spatial data loaded and projected successfully.`,
                });
            }, 2000);
        }
    };

    return (
        React.createElement(Layout, { title: "Area & Spatial Management"   }
            , React.createElement('div', { className: "flex flex-col gap-8 w-full max-w-[1400px] mx-auto min-w-0 pb-20"       }
                /* Visual Progress Header */
                , React.createElement('div', { className: "flex flex-col items-center justify-center w-full py-4"     }
                    , React.createElement('div', { className: "flex items-start w-full max-w-3xl relative"    }
                        /* Connector Line (Background) */
                        , React.createElement('div', { className: "absolute top-6 left-[25%] right-[25%] h-0.5 bg-muted z-0"      } )

                        /* Connector Line (Progress) */
                        , React.createElement('div', { className: "absolute top-6 left-[25%] right-[25%] h-0.5 z-0 transition-all duration-500 ease-in-out overflow-hidden"         }
                            , React.createElement('div', { className: `h-full bg-primary transition-all duration-500 ${step > 1 ? 'w-full' : 'w-0'}`} )
                        )

                        /* Step 1 */
                        , React.createElement('div', { className: "flex flex-col items-center flex-1 relative z-10"     }
                            , React.createElement('div', { className: "relative"}
                                , step === 1 && (
                                    React.createElement('div', { className: "absolute inset-0 rounded-full bg-red-500/40 animate-ping"    } )
                                )
                                , React.createElement('div', { className: `relative flex items-center justify-center h-12 w-12 rounded-full border-2 transition-all duration-300 bg-white ${step >= 1 ? 'border-primary text-primary shadow-xl shadow-primary/10' : 'border-muted text-muted-foreground'}`}
                                    , step > 1 ? (
                                        React.createElement('div', { className: "bg-emerald-600 h-full w-full rounded-full flex items-center justify-center text-white scale-100 shadow-lg shadow-emerald-200"          }
                                            , React.createElement(Check, { className: "h-6 w-6" } )
                                        )
                                    ) : (
                                        React.createElement('span', { className: "font-black text-lg" }, "1")
                                    )
                                )
                            )
                            , React.createElement('div', { className: "mt-4 text-center px-4"  }
                                , React.createElement('h3', { className: `text-[12px] font-black uppercase tracking-widest leading-none ${step >= 1 ? 'text-primary' : 'text-muted-foreground'}`}, "Hierarchy Definition" )
                                , React.createElement('p', { className: "text-[10px] text-muted-foreground mt-2 font-medium max-w-[180px] mx-auto"     }, "Define Division, District and Tehsil administrative structure"      )
                            )
                        )

                        /* Step 2 */
                        , React.createElement('div', { className: "flex flex-col items-center flex-1 relative z-10"     }
                            , React.createElement('div', { className: "relative"}
                                , step === 2 && (
                                    React.createElement('div', { className: "absolute inset-0 rounded-full bg-red-500/40 animate-ping"    } )
                                )
                                , React.createElement('div', { className: `relative flex items-center justify-center h-12 w-12 rounded-full border-2 transition-all duration-300 bg-white ${step >= 2 ? 'border-primary text-white bg-primary shadow-xl shadow-primary/20 scale-110' : 'border-muted text-muted-foreground'}`}
                                    , React.createElement('span', { className: "font-black text-lg" }, "2")
                                )
                            )
                            , React.createElement('div', { className: "mt-4 text-center px-4"  }
                                , React.createElement('h3', { className: `text-[12px] font-black uppercase tracking-widest leading-none ${step >= 2 ? 'text-primary' : 'text-muted-foreground'}`}, "Spatial Integration" )
                                , React.createElement('p', { className: "text-[10px] text-muted-foreground mt-2 font-medium max-w-[180px] mx-auto"     }, "Upload spatial assets and verify boundaries on the map"        )
                            )
                        )
                    )
                )

                , React.createElement('div', { className: "grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch"    }
                    /* Form Component */
                    , React.createElement(motion.div, {
                        initial: { opacity: 0, x: -20 },
                        animate: { opacity: 1, x: 0 },
                        className: "w-full"}

                        , React.createElement(AnimatePresence, { mode: "wait"}
                            , step === 1 ? (
                                React.createElement(motion.div, {
                                    key: "step1",
                                    initial: { opacity: 0, scale: 0.98 },
                                    animate: { opacity: 1, scale: 1 },
                                    exit: { opacity: 0, scale: 0.98 },
                                    transition: { duration: 0.3 },
                                    className: "h-full"}

                                    , React.createElement(Card, { className: "border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden h-full flex flex-col"     }
                                        , React.createElement('div', { className: "h-2 bg-primary w-full"  } )
                                        , React.createElement(CardHeader, { className: "space-y-1 pb-4" }
                                            , React.createElement(CardTitle, { className: "text-xl font-black text-primary flex items-center gap-2"     }
                                                , React.createElement(Layers, { className: "h-5 w-5 text-secondary"  } ), " Area Information"
                                            )
                                            , React.createElement(CardDescription, { className: "font-medium"}, "Populate the administrative hierarchy for the new area."       )
                                        )
                                        , React.createElement(CardContent, { className: "space-y-6"}
                                            , React.createElement('div', { className: "space-y-3"}
                                                , React.createElement(Label, { className: "text-[11px] font-black uppercase tracking-widest text-primary/60"    }, "Select Division" )
                                                , React.createElement(Select, { onValueChange: (v) => setFormData({ ...formData, division: v }), value: formData.division}
                                                    , React.createElement(SelectTrigger, { className: "h-12 rounded-xl border-muted-foreground/20 font-bold focus:ring-primary/10"    }
                                                        , React.createElement(SelectValue, { placeholder: "Choose Division" } )
                                                    )
                                                    , React.createElement(SelectContent, {}
                                                        , React.createElement(SelectItem, { value: "lahore", className: "font-bold"}, "Lahore Division" )
                                                        , React.createElement(SelectItem, { value: "rawalpindi", className: "font-bold"}, "Rawalpindi Division" )
                                                        , React.createElement(SelectItem, { value: "gujranwala", className: "font-bold"}, "Gujranwala Division" )
                                                        , React.createElement(SelectItem, { value: "new", className: "text-secondary font-black italic"  }, "+ Propose New Division"   )
                                                    )
                                                )
                                            )

                                            , React.createElement('div', { className: "space-y-3"}
                                                , React.createElement(Label, { className: "text-[11px] font-black uppercase tracking-widest text-primary/60"    }, "Select District" )
                                                , React.createElement(Select, { onValueChange: (v) => setFormData({ ...formData, district: v }), value: formData.district}
                                                    , React.createElement(SelectTrigger, { className: "h-12 rounded-xl border-muted-foreground/20 font-bold focus:ring-primary/10"    }
                                                        , React.createElement(SelectValue, { placeholder: "Choose District" } )
                                                    )
                                                    , React.createElement(SelectContent, {}
                                                        , React.createElement(SelectItem, { value: "dist1", className: "font-bold"}, "Lahore District" )
                                                        , React.createElement(SelectItem, { value: "dist2", className: "font-bold"}, "Kasur District" )
                                                        , React.createElement(SelectItem, { value: "new_dist", className: "text-secondary font-black italic"  }, "+ Propose New District"   )
                                                    )
                                                )
                                            )

                                            , React.createElement('div', { className: "space-y-3"}
                                                , React.createElement(Label, { className: "text-[11px] font-black uppercase tracking-widest text-primary/60"    }, "Tehsil Name" )
                                                , React.createElement('div', { className: "relative group" }
                                                    , React.createElement(Input, {
                                                        placeholder: "e.g. Model Town"  ,
                                                        className: "h-12 pl-10 rounded-xl border-muted-foreground/20 font-bold focus:ring-primary/10"     ,
                                                        value: formData.tehsil,
                                                        onChange: (e) => setFormData({ ...formData, tehsil: e.target.value })}
                                                    )
                                                    , React.createElement(Navigation2, { className: "absolute left-3 top-3.5 h-4 w-4 text-muted-foreground/60 transition-colors group-focus-within:text-primary"       } )
                                                )
                                            )

                                            , React.createElement(Button, {
                                                onClick: handleNext,
                                                className: "w-full h-14 bg-primary hover:bg-primary/95 text-white font-black text-[15px] rounded-xl shadow-xl shadow-primary/10 group mt-4 transition-all"            }
, "Proceed to Spatial Integration"

                                                , React.createElement(ChevronRight, { className: "h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform"    } )
                                            )
                                        )
                                    )
                                )
                            ) : (
                                React.createElement(motion.div, {
                                    key: "step2",
                                    initial: { opacity: 0, scale: 0.98 },
                                    animate: { opacity: 1, scale: 1 },
                                    exit: { opacity: 0, scale: 0.98 },
                                    transition: { duration: 0.3 },
                                    className: "h-full"}

                                    , React.createElement(Card, { className: "border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden h-full flex flex-col"     }
                                        , React.createElement('div', { className: "h-2 bg-secondary w-full"  } )
                                        , React.createElement(CardHeader, { className: "space-y-1 pb-4" }
                                            , React.createElement('div', { className: "flex items-center gap-2 mb-2"   }
                                                , React.createElement(Button, { variant: "ghost", size: "sm", onClick: handleBack, className: "h-8 w-8 p-0 rounded-full hover:bg-muted"    }
                                                    , React.createElement(ArrowLeft, { className: "h-4 w-4" } )
                                                )
                                                , React.createElement('span', { className: "text-[10px] uppercase font-black tracking-widest text-muted-foreground"    }, "Go Back" )
                                            )
                                            , React.createElement(CardTitle, { className: "text-xl font-black text-primary flex items-center gap-2"     }
                                                , React.createElement(Globe, { className: "h-5 w-5 text-secondary"  } ), " Spatial Asset Upload"
                                            )
                                            , React.createElement(CardDescription, { className: "font-medium"}, "Upload shapefiles or GeoJSON boundaries for the defined area."        )
                                        )
                                        , React.createElement(CardContent, { className: "space-y-6"}
                                            , React.createElement('div', {
                                                className: `relative border-2 border-dashed rounded-2xl p-10 flex flex-col items-center justify-center transition-all ${uploadedFile ? 'border-emerald-600/50 bg-emerald-50/10' : 'border-muted-foreground/20 hover:border-primary/50'}`}

                                                , React.createElement('input', {
                                                    type: "file",
                                                    className: "absolute inset-0 opacity-0 cursor-pointer"   ,
                                                    onChange: handleFileChange,
                                                    accept: ".zip,.shp,.kml,.kmz,.json,.geojson"}
                                                )
                                                , isUploading ? (
                                                    React.createElement('div', { className: "flex flex-col items-center animate-pulse"   }
                                                        , React.createElement('div', { className: "h-12 w-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-4"       } )
                                                        , React.createElement('p', { className: "text-sm font-bold text-primary italic"   }, "Parsing Geometries..." )
                                                    )
                                                ) : uploadedFile ? (
                                                    React.createElement('div', { className: "flex flex-col items-center text-center"   }
                                                        , React.createElement('div', { className: "h-16 w-16 bg-emerald-100/50 text-emerald-700 rounded-2xl flex items-center justify-center mb-4"        }
                                                            , React.createElement(Globe, { className: "h-8 w-8" } )
                                                        )
                                                        , React.createElement('p', { className: "font-bold text-sm text-emerald-800"  }, uploadedFile.name)
                                                        , React.createElement('p', { className: "text-[10px] text-muted-foreground mt-1 uppercase font-black tracking-widest"     }, "Format: " , _optionalChain([uploadedFile, 'access', _8 => _8.name, 'access', _9 => _9.split, 'call', _10 => _10('.'), 'access', _11 => _11.pop, 'call', _12 => _12(), 'optionalAccess', _13 => _13.toUpperCase, 'call', _14 => _14()]), " â€¢ "  , (uploadedFile.size / 1024 / 1024).toFixed(2), " MB" )
                                                    )
                                                ) : (
                                                    React.createElement('div', { className: "flex flex-col items-center text-center px-4"    }
                                                        , React.createElement('div', { className: "h-16 w-16 bg-primary/5 text-primary rounded-2xl flex items-center justify-center mb-4"        }
                                                            , React.createElement(Upload, { className: "h-8 w-8 transition-transform group-hover:-translate-y-1"   } )
                                                        )
                                                        , React.createElement('p', { className: "font-bold text-sm" }, "Spatial Data Upload"  )
                                                        , React.createElement('p', { className: "text-xs text-muted-foreground mt-2 max-w-[240px]"   }, "Supporting .SHP (Zipped), .KML, .KMZ, and .GeoJSON formats"       )
                                                    )
                                                )
                                            )

                                            , React.createElement('div', { className: "bg-primary/5 rounded-xl p-4 flex items-start gap-3 border border-primary/10"       }
                                                , React.createElement(AlertCircle, { className: "h-5 w-5 text-primary mt-0.5"   } )
                                                , React.createElement('div', { className: "space-y-1"}
                                                    , React.createElement('p', { className: "text-xs font-bold text-primary"  }, "Spatial Requirement" )
                                                    , React.createElement('p', { className: "text-[10px] leading-relaxed text-primary/70 font-medium"   }, "Coordinate system must be WGS84. Ensure the polygon is closed and without intersections for accurate dashboard projection."                )
                                                )
                                            )

                                            , React.createElement(Button, {
                                                disabled: !uploadedFile || isUploading,
                                                className: "w-full h-14 bg-secondary hover:bg-secondary/95 text-white font-black text-[15px] rounded-xl shadow-xl shadow-secondary/10 group mt-4 transition-all"            }
, "Finalize Area Integration"

                                                , React.createElement(Check, { className: "h-5 w-5 ml-2"  } )
                                            )
                                        )
                                    )
                                )
                            )
                        )
                    )

                    /* Map removed: available only on Dashboard (divisions) and /gis */
                    , React.createElement(motion.div, {
                        initial: { opacity: 0, x: 20 },
                        animate: { opacity: 1, x: 0 },
                        className: "w-full h-full"}
                        , React.createElement(Card, { className: "border-none shadow-[0_8px_40px_rgb(0,0,0,0.06)] overflow-hidden flex flex-col h-full min-h-[420px] sm:min-h-[520px] lg:min-h-[600px]"}
                            , React.createElement(CardHeader, { className: "bg-white/80 backdrop-blur-md border-b z-10 py-4"}
                                , React.createElement('div', { className: "flex items-center gap-3"}
                                    , React.createElement('div', { className: "h-10 w-10 bg-primary rounded-xl flex items-center justify-center text-white shadow-lg shadow-primary/20"}
                                        , React.createElement(MapPin, { className: "h-5 w-5"} )
                                    )
                                    , React.createElement('div', {}
                                        , React.createElement(CardTitle, { className: "text-sm font-black uppercase tracking-widest text-primary"}, "Map Preview Disabled")
                                        , React.createElement('p', { className: "text-[11px] text-muted-foreground font-medium"}
                                            , "Maps are available on Dashboard (Divisions) and GIS Layers only."
                                        )
                                    )
                                )
                            )
                            , React.createElement(CardContent, { className: "p-6 flex-1 bg-muted/30 flex items-center justify-center"}
                                , React.createElement('div', { className: "text-center max-w-sm"}
                                    , React.createElement('p', { className: "text-sm font-semibold text-primary"}, "Need the map?")
                                    , React.createElement('p', { className: "text-xs text-muted-foreground mt-1"}
                                        , "Open the GIS page to view layers and project locations."
                                    )
                                )
                            )
                        )
                    )
                )
            )
        )
    );
}