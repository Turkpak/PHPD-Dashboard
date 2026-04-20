import React from "react";
const _jsxFileName = ""; function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }
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
import { CityMap } from "@/components/dashboard/CityMap";
import { useToast } from "@/hooks/use-toast";


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
        React.createElement(Layout, { title: "Area & Spatial Management"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 105}}
            , React.createElement('div', { className: "flex flex-col gap-8 w-full max-w-[1400px] mx-auto min-w-0 pb-20"       , __self: this, __source: {fileName: _jsxFileName, lineNumber: 106}}
                /* Visual Progress Header */
                , React.createElement('div', { className: "flex flex-col items-center justify-center w-full py-4"     , __self: this, __source: {fileName: _jsxFileName, lineNumber: 108}}
                    , React.createElement('div', { className: "flex items-start w-full max-w-3xl relative"    , __self: this, __source: {fileName: _jsxFileName, lineNumber: 109}}
                        /* Connector Line (Background) */
                        , React.createElement('div', { className: "absolute top-6 left-[25%] right-[25%] h-0.5 bg-muted z-0"      , __self: this, __source: {fileName: _jsxFileName, lineNumber: 111}} )

                        /* Connector Line (Progress) */
                        , React.createElement('div', { className: "absolute top-6 left-[25%] right-[25%] h-0.5 z-0 transition-all duration-500 ease-in-out overflow-hidden"         , __self: this, __source: {fileName: _jsxFileName, lineNumber: 114}}
                            , React.createElement('div', { className: `h-full bg-primary transition-all duration-500 ${step > 1 ? 'w-full' : 'w-0'}`, __self: this, __source: {fileName: _jsxFileName, lineNumber: 115}} )
                        )

                        /* Step 1 */
                        , React.createElement('div', { className: "flex flex-col items-center flex-1 relative z-10"     , __self: this, __source: {fileName: _jsxFileName, lineNumber: 119}}
                            , React.createElement('div', { className: "relative", __self: this, __source: {fileName: _jsxFileName, lineNumber: 120}}
                                , step === 1 && (
                                    React.createElement('div', { className: "absolute inset-0 rounded-full bg-red-500/40 animate-ping"    , __self: this, __source: {fileName: _jsxFileName, lineNumber: 122}} )
                                )
                                , React.createElement('div', { className: `relative flex items-center justify-center h-12 w-12 rounded-full border-2 transition-all duration-300 bg-white ${step >= 1 ? 'border-primary text-primary shadow-xl shadow-primary/10' : 'border-muted text-muted-foreground'}`, __self: this, __source: {fileName: _jsxFileName, lineNumber: 124}}
                                    , step > 1 ? (
                                        React.createElement('div', { className: "bg-emerald-600 h-full w-full rounded-full flex items-center justify-center text-white scale-100 shadow-lg shadow-emerald-200"          , __self: this, __source: {fileName: _jsxFileName, lineNumber: 126}}
                                            , React.createElement(Check, { className: "h-6 w-6" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 127}} )
                                        )
                                    ) : (
                                        React.createElement('span', { className: "font-black text-lg" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 130}}, "1")
                                    )
                                )
                            )
                            , React.createElement('div', { className: "mt-4 text-center px-4"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 134}}
                                , React.createElement('h3', { className: `text-[12px] font-black uppercase tracking-widest leading-none ${step >= 1 ? 'text-primary' : 'text-muted-foreground'}`, __self: this, __source: {fileName: _jsxFileName, lineNumber: 135}}, "Hierarchy Definition" )
                                , React.createElement('p', { className: "text-[10px] text-muted-foreground mt-2 font-medium max-w-[180px] mx-auto"     , __self: this, __source: {fileName: _jsxFileName, lineNumber: 136}}, "Define Division, District and Tehsil administrative structure"      )
                            )
                        )

                        /* Step 2 */
                        , React.createElement('div', { className: "flex flex-col items-center flex-1 relative z-10"     , __self: this, __source: {fileName: _jsxFileName, lineNumber: 141}}
                            , React.createElement('div', { className: "relative", __self: this, __source: {fileName: _jsxFileName, lineNumber: 142}}
                                , step === 2 && (
                                    React.createElement('div', { className: "absolute inset-0 rounded-full bg-red-500/40 animate-ping"    , __self: this, __source: {fileName: _jsxFileName, lineNumber: 144}} )
                                )
                                , React.createElement('div', { className: `relative flex items-center justify-center h-12 w-12 rounded-full border-2 transition-all duration-300 bg-white ${step >= 2 ? 'border-primary text-white bg-primary shadow-xl shadow-primary/20 scale-110' : 'border-muted text-muted-foreground'}`, __self: this, __source: {fileName: _jsxFileName, lineNumber: 146}}
                                    , React.createElement('span', { className: "font-black text-lg" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 147}}, "2")
                                )
                            )
                            , React.createElement('div', { className: "mt-4 text-center px-4"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 150}}
                                , React.createElement('h3', { className: `text-[12px] font-black uppercase tracking-widest leading-none ${step >= 2 ? 'text-primary' : 'text-muted-foreground'}`, __self: this, __source: {fileName: _jsxFileName, lineNumber: 151}}, "Spatial Integration" )
                                , React.createElement('p', { className: "text-[10px] text-muted-foreground mt-2 font-medium max-w-[180px] mx-auto"     , __self: this, __source: {fileName: _jsxFileName, lineNumber: 152}}, "Upload spatial assets and verify boundaries on the map"        )
                            )
                        )
                    )
                )

                , React.createElement('div', { className: "grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch"    , __self: this, __source: {fileName: _jsxFileName, lineNumber: 158}}
                    /* Form Component */
                    , React.createElement(motion.div, {
                        initial: { opacity: 0, x: -20 },
                        animate: { opacity: 1, x: 0 },
                        className: "w-full", __self: this, __source: {fileName: _jsxFileName, lineNumber: 160}}

                        , React.createElement(AnimatePresence, { mode: "wait", __self: this, __source: {fileName: _jsxFileName, lineNumber: 165}}
                            , step === 1 ? (
                                React.createElement(motion.div, {
                                    key: "step1",
                                    initial: { opacity: 0, scale: 0.98 },
                                    animate: { opacity: 1, scale: 1 },
                                    exit: { opacity: 0, scale: 0.98 },
                                    transition: { duration: 0.3 },
                                    className: "h-full", __self: this, __source: {fileName: _jsxFileName, lineNumber: 167}}

                                    , React.createElement(Card, { className: "border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden h-full flex flex-col"     , __self: this, __source: {fileName: _jsxFileName, lineNumber: 175}}
                                        , React.createElement('div', { className: "h-2 bg-primary w-full"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 176}} )
                                        , React.createElement(CardHeader, { className: "space-y-1 pb-4" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 177}}
                                            , React.createElement(CardTitle, { className: "text-xl font-black text-primary flex items-center gap-2"     , __self: this, __source: {fileName: _jsxFileName, lineNumber: 178}}
                                                , React.createElement(Layers, { className: "h-5 w-5 text-secondary"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 179}} ), " Area Information"
                                            )
                                            , React.createElement(CardDescription, { className: "font-medium", __self: this, __source: {fileName: _jsxFileName, lineNumber: 181}}, "Populate the administrative hierarchy for the new area."       )
                                        )
                                        , React.createElement(CardContent, { className: "space-y-6", __self: this, __source: {fileName: _jsxFileName, lineNumber: 183}}
                                            , React.createElement('div', { className: "space-y-3", __self: this, __source: {fileName: _jsxFileName, lineNumber: 184}}
                                                , React.createElement(Label, { className: "text-[11px] font-black uppercase tracking-widest text-primary/60"    , __self: this, __source: {fileName: _jsxFileName, lineNumber: 185}}, "Select Division" )
                                                , React.createElement(Select, { onValueChange: (v) => setFormData({ ...formData, division: v }), value: formData.division, __self: this, __source: {fileName: _jsxFileName, lineNumber: 186}}
                                                    , React.createElement(SelectTrigger, { className: "h-12 rounded-xl border-muted-foreground/20 font-bold focus:ring-primary/10"    , __self: this, __source: {fileName: _jsxFileName, lineNumber: 187}}
                                                        , React.createElement(SelectValue, { placeholder: "Choose Division" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 188}} )
                                                    )
                                                    , React.createElement(SelectContent, {__self: this, __source: {fileName: _jsxFileName, lineNumber: 190}}
                                                        , React.createElement(SelectItem, { value: "lahore", className: "font-bold", __self: this, __source: {fileName: _jsxFileName, lineNumber: 191}}, "Lahore Division" )
                                                        , React.createElement(SelectItem, { value: "rawalpindi", className: "font-bold", __self: this, __source: {fileName: _jsxFileName, lineNumber: 192}}, "Rawalpindi Division" )
                                                        , React.createElement(SelectItem, { value: "gujranwala", className: "font-bold", __self: this, __source: {fileName: _jsxFileName, lineNumber: 193}}, "Gujranwala Division" )
                                                        , React.createElement(SelectItem, { value: "new", className: "text-secondary font-black italic"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 194}}, "+ Propose New Division"   )
                                                    )
                                                )
                                            )

                                            , React.createElement('div', { className: "space-y-3", __self: this, __source: {fileName: _jsxFileName, lineNumber: 199}}
                                                , React.createElement(Label, { className: "text-[11px] font-black uppercase tracking-widest text-primary/60"    , __self: this, __source: {fileName: _jsxFileName, lineNumber: 200}}, "Select District" )
                                                , React.createElement(Select, { onValueChange: (v) => setFormData({ ...formData, district: v }), value: formData.district, __self: this, __source: {fileName: _jsxFileName, lineNumber: 201}}
                                                    , React.createElement(SelectTrigger, { className: "h-12 rounded-xl border-muted-foreground/20 font-bold focus:ring-primary/10"    , __self: this, __source: {fileName: _jsxFileName, lineNumber: 202}}
                                                        , React.createElement(SelectValue, { placeholder: "Choose District" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 203}} )
                                                    )
                                                    , React.createElement(SelectContent, {__self: this, __source: {fileName: _jsxFileName, lineNumber: 205}}
                                                        , React.createElement(SelectItem, { value: "dist1", className: "font-bold", __self: this, __source: {fileName: _jsxFileName, lineNumber: 206}}, "Lahore District" )
                                                        , React.createElement(SelectItem, { value: "dist2", className: "font-bold", __self: this, __source: {fileName: _jsxFileName, lineNumber: 207}}, "Kasur District" )
                                                        , React.createElement(SelectItem, { value: "new_dist", className: "text-secondary font-black italic"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 208}}, "+ Propose New District"   )
                                                    )
                                                )
                                            )

                                            , React.createElement('div', { className: "space-y-3", __self: this, __source: {fileName: _jsxFileName, lineNumber: 213}}
                                                , React.createElement(Label, { className: "text-[11px] font-black uppercase tracking-widest text-primary/60"    , __self: this, __source: {fileName: _jsxFileName, lineNumber: 214}}, "Tehsil Name" )
                                                , React.createElement('div', { className: "relative group" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 215}}
                                                    , React.createElement(Input, {
                                                        placeholder: "e.g. Model Town"  ,
                                                        className: "h-12 pl-10 rounded-xl border-muted-foreground/20 font-bold focus:ring-primary/10"     ,
                                                        value: formData.tehsil,
                                                        onChange: (e) => setFormData({ ...formData, tehsil: e.target.value }), __self: this, __source: {fileName: _jsxFileName, lineNumber: 216}}
                                                    )
                                                    , React.createElement(Navigation2, { className: "absolute left-3 top-3.5 h-4 w-4 text-muted-foreground/60 transition-colors group-focus-within:text-primary"       , __self: this, __source: {fileName: _jsxFileName, lineNumber: 222}} )
                                                )
                                            )

                                            , React.createElement(Button, {
                                                onClick: handleNext,
                                                className: "w-full h-14 bg-primary hover:bg-primary/95 text-white font-black text-[15px] rounded-xl shadow-xl shadow-primary/10 group mt-4 transition-all"            , __self: this, __source: {fileName: _jsxFileName, lineNumber: 226}}
, "Proceed to Spatial Integration"

                                                , React.createElement(ChevronRight, { className: "h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform"    , __self: this, __source: {fileName: _jsxFileName, lineNumber: 231}} )
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
                                    className: "h-full", __self: this, __source: {fileName: _jsxFileName, lineNumber: 237}}

                                    , React.createElement(Card, { className: "border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden h-full flex flex-col"     , __self: this, __source: {fileName: _jsxFileName, lineNumber: 245}}
                                        , React.createElement('div', { className: "h-2 bg-secondary w-full"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 246}} )
                                        , React.createElement(CardHeader, { className: "space-y-1 pb-4" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 247}}
                                            , React.createElement('div', { className: "flex items-center gap-2 mb-2"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 248}}
                                                , React.createElement(Button, { variant: "ghost", size: "sm", onClick: handleBack, className: "h-8 w-8 p-0 rounded-full hover:bg-muted"    , __self: this, __source: {fileName: _jsxFileName, lineNumber: 249}}
                                                    , React.createElement(ArrowLeft, { className: "h-4 w-4" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 250}} )
                                                )
                                                , React.createElement('span', { className: "text-[10px] uppercase font-black tracking-widest text-muted-foreground"    , __self: this, __source: {fileName: _jsxFileName, lineNumber: 252}}, "Go Back" )
                                            )
                                            , React.createElement(CardTitle, { className: "text-xl font-black text-primary flex items-center gap-2"     , __self: this, __source: {fileName: _jsxFileName, lineNumber: 254}}
                                                , React.createElement(Globe, { className: "h-5 w-5 text-secondary"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 255}} ), " Spatial Asset Upload"
                                            )
                                            , React.createElement(CardDescription, { className: "font-medium", __self: this, __source: {fileName: _jsxFileName, lineNumber: 257}}, "Upload shapefiles or GeoJSON boundaries for the defined area."        )
                                        )
                                        , React.createElement(CardContent, { className: "space-y-6", __self: this, __source: {fileName: _jsxFileName, lineNumber: 259}}
                                            , React.createElement('div', {
                                                className: `relative border-2 border-dashed rounded-2xl p-10 flex flex-col items-center justify-center transition-all ${uploadedFile ? 'border-emerald-600/50 bg-emerald-50/10' : 'border-muted-foreground/20 hover:border-primary/50'}`, __self: this, __source: {fileName: _jsxFileName, lineNumber: 260}}

                                                , React.createElement('input', {
                                                    type: "file",
                                                    className: "absolute inset-0 opacity-0 cursor-pointer"   ,
                                                    onChange: handleFileChange,
                                                    accept: ".zip,.shp,.kml,.kmz,.json,.geojson", __self: this, __source: {fileName: _jsxFileName, lineNumber: 263}}
                                                )
                                                , isUploading ? (
                                                    React.createElement('div', { className: "flex flex-col items-center animate-pulse"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 270}}
                                                        , React.createElement('div', { className: "h-12 w-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-4"       , __self: this, __source: {fileName: _jsxFileName, lineNumber: 271}} )
                                                        , React.createElement('p', { className: "text-sm font-bold text-primary italic"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 272}}, "Parsing Geometries..." )
                                                    )
                                                ) : uploadedFile ? (
                                                    React.createElement('div', { className: "flex flex-col items-center text-center"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 275}}
                                                        , React.createElement('div', { className: "h-16 w-16 bg-emerald-100/50 text-emerald-700 rounded-2xl flex items-center justify-center mb-4"        , __self: this, __source: {fileName: _jsxFileName, lineNumber: 276}}
                                                            , React.createElement(Globe, { className: "h-8 w-8" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 277}} )
                                                        )
                                                        , React.createElement('p', { className: "font-bold text-sm text-emerald-800"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 279}}, uploadedFile.name)
                                                        , React.createElement('p', { className: "text-[10px] text-muted-foreground mt-1 uppercase font-black tracking-widest"     , __self: this, __source: {fileName: _jsxFileName, lineNumber: 280}}, "Format: " , _optionalChain([uploadedFile, 'access', _8 => _8.name, 'access', _9 => _9.split, 'call', _10 => _10('.'), 'access', _11 => _11.pop, 'call', _12 => _12(), 'optionalAccess', _13 => _13.toUpperCase, 'call', _14 => _14()]), " • "  , (uploadedFile.size / 1024 / 1024).toFixed(2), " MB" )
                                                    )
                                                ) : (
                                                    React.createElement('div', { className: "flex flex-col items-center text-center px-4"    , __self: this, __source: {fileName: _jsxFileName, lineNumber: 283}}
                                                        , React.createElement('div', { className: "h-16 w-16 bg-primary/5 text-primary rounded-2xl flex items-center justify-center mb-4"        , __self: this, __source: {fileName: _jsxFileName, lineNumber: 284}}
                                                            , React.createElement(Upload, { className: "h-8 w-8 transition-transform group-hover:-translate-y-1"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 285}} )
                                                        )
                                                        , React.createElement('p', { className: "font-bold text-sm" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 287}}, "Spatial Data Upload"  )
                                                        , React.createElement('p', { className: "text-xs text-muted-foreground mt-2 max-w-[240px]"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 288}}, "Supporting .SHP (Zipped), .KML, .KMZ, and .GeoJSON formats"       )
                                                    )
                                                )
                                            )

                                            , React.createElement('div', { className: "bg-primary/5 rounded-xl p-4 flex items-start gap-3 border border-primary/10"       , __self: this, __source: {fileName: _jsxFileName, lineNumber: 293}}
                                                , React.createElement(AlertCircle, { className: "h-5 w-5 text-primary mt-0.5"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 294}} )
                                                , React.createElement('div', { className: "space-y-1", __self: this, __source: {fileName: _jsxFileName, lineNumber: 295}}
                                                    , React.createElement('p', { className: "text-xs font-bold text-primary"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 296}}, "Spatial Requirement" )
                                                    , React.createElement('p', { className: "text-[10px] leading-relaxed text-primary/70 font-medium"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 297}}, "Coordinate system must be WGS84. Ensure the polygon is closed and without intersections for accurate dashboard projection."                )
                                                )
                                            )

                                            , React.createElement(Button, {
                                                disabled: !uploadedFile || isUploading,
                                                className: "w-full h-14 bg-secondary hover:bg-secondary/95 text-white font-black text-[15px] rounded-xl shadow-xl shadow-secondary/10 group mt-4 transition-all"            , __self: this, __source: {fileName: _jsxFileName, lineNumber: 301}}
, "Finalize Area Integration"

                                                , React.createElement(Check, { className: "h-5 w-5 ml-2"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 306}} )
                                            )
                                        )
                                    )
                                )
                            )
                        )
                    )

                    /* Map Component */
                    , React.createElement(motion.div, {
                        initial: { opacity: 0, x: 20 },
                        animate: { opacity: 1, x: 0 },
                        className: "w-full h-full" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 316}}

                        , React.createElement(Card, { className: "border-none shadow-[0_8px_40px_rgb(0,0,0,0.06)] overflow-hidden flex flex-col h-full min-h-[420px] sm:min-h-[520px] lg:min-h-[600px]"        , __self: this, __source: {fileName: _jsxFileName, lineNumber: 321}}
                            , React.createElement(CardHeader, { className: "bg-white/80 backdrop-blur-md border-b z-10 py-4"    , __self: this, __source: {fileName: _jsxFileName, lineNumber: 322}}
                                , React.createElement('div', { className: "flex items-center justify-between"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 323}}
                                    , React.createElement('div', { className: "flex items-center gap-3"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 324}}
                                        , React.createElement('div', { className: "h-10 w-10 bg-primary rounded-xl flex items-center justify-center text-white shadow-lg shadow-primary/20"         , __self: this, __source: {fileName: _jsxFileName, lineNumber: 325}}
                                            , React.createElement(MapPin, { className: "h-5 w-5" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 326}} )
                                        )
                                        , React.createElement('div', {__self: this, __source: {fileName: _jsxFileName, lineNumber: 328}}
                                            , React.createElement(CardTitle, { className: "text-sm font-black uppercase tracking-widest text-primary"    , __self: this, __source: {fileName: _jsxFileName, lineNumber: 329}}, "Integration Preview" )
                                            , React.createElement('p', { className: "text-[10px] text-muted-foreground font-bold italic"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 330}}
                                                , step === 1 ? "Administrative Context Mapping" : `Live Spatial Validation: ${formData.tehsil || 'Pending'}`
                                            )
                                        )
                                    )
                                    , uploadedFile && (
                                        React.createElement('div', { className: "flex items-center gap-2 px-3 py-1 bg-emerald-50 rounded-full border border-emerald-100"        , __self: this, __source: {fileName: _jsxFileName, lineNumber: 336}}
                                            , React.createElement('div', { className: "h-2 w-2 bg-emerald-600 rounded-full animate-pulse"    , __self: this, __source: {fileName: _jsxFileName, lineNumber: 337}} )
                                            , React.createElement('span', { className: "text-[10px] font-black text-emerald-700 uppercase tracking-widest"    , __self: this, __source: {fileName: _jsxFileName, lineNumber: 338}}, "Active " , _optionalChain([uploadedFile, 'access', _15 => _15.name, 'access', _16 => _16.split, 'call', _17 => _17('.'), 'access', _18 => _18.pop, 'call', _19 => _19(), 'optionalAccess', _20 => _20.toUpperCase, 'call', _21 => _21()]))
                                        )
                                    )
                                )
                            )
                            , React.createElement(CardContent, { className: "p-0 flex-1 relative bg-muted"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 343}}
                                , React.createElement(CityMap, {
                                    city: formData.division || "lahore",
                                    activeLayers: new Set(),
                                    geoData: uploadedGeoData,
                                    showStats: false, __self: this, __source: {fileName: _jsxFileName, lineNumber: 344}}
                                )

                                , React.createElement(AnimatePresence, {__self: this, __source: {fileName: _jsxFileName, lineNumber: 351}}
                                    , step === 2 && !uploadedFile && (
                                        React.createElement(motion.div, {
                                            initial: { opacity: 0 },
                                            animate: { opacity: 1 },
                                            exit: { opacity: 0 },
                                            className: "absolute inset-0 z-20 bg-primary/20 backdrop-blur-[2px] flex items-center justify-center pointer-events-none"        , __self: this, __source: {fileName: _jsxFileName, lineNumber: 353}}

                                            , React.createElement('div', { className: "bg-white/90 px-6 py-4 rounded-2xl shadow-2xl border border-white flex items-center gap-4"         , __self: this, __source: {fileName: _jsxFileName, lineNumber: 359}}
                                                , React.createElement(Upload, { className: "h-6 w-6 text-primary animate-bounce"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 360}} )
                                                , React.createElement('p', { className: "text-sm font-black text-primary uppercase tracking-widest"    , __self: this, __source: {fileName: _jsxFileName, lineNumber: 361}}, "Waiting for Spatial Asset"   )
                                            )
                                        )
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
