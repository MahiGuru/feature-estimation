// <div>
//   <Label className="text-sm font-medium text-gray-700 mb-2 block">
//     Choose Epic
//   </Label>
//   <Select
//     value={detailedFeatureEpic}
//     onValueChange={(value) => {
//       if (value === "ADD_NEW_EPIC") {
//         setShowCustomEpicDialog(true);
//       } else {
//         setDetailedFeatureEpic(value);
//       }
//     }}
//   >
//     <SelectTrigger className="form-input">
//       <SelectValue placeholder="Select or enter related epic" />
//     </SelectTrigger>
//     <SelectContent>
//       {/* Add New Epic Option */}
//       <SelectItem value="ADD_NEW_EPIC">
//         <div className="flex items-center space-x-2">
//           <Plus className="w-4 h-4 text-blue-600" />
//           <span className="text-blue-600 font-medium">Add New Epic</span>
//         </div>
//       </SelectItem>

//       <div className="my-2 border-t" />

//       {/* Custom Epics */}
//       {customEpics.length > 0 && (
//         <>
//           <div className="px-2 py-1.5 text-xs font-semibold text-gray-500">
//             Custom Epics
//           </div>
//           {customEpics.map((epic) => (
//             <SelectItem key={`custom-${epic}`} value={epic}>
//               <div className="flex items-center space-x-2">
//                 <Badge className="bg-green-100 text-green-700 text-xs">
//                   Custom
//                 </Badge>
//                 <span>{epic}</span>
//               </div>
//             </SelectItem>
//           ))}
//           <div className="my-2 border-t" />
//         </>
//       )}

//       <div className="px-2 py-1.5 text-xs font-semibold text-gray-500">
//         Predefined Epics
//       </div>
//       {PREDEFINED_EPICS.map((epic) => (
//         <SelectItem key={epic} value={epic}>
//           <div className="flex items-center space-x-2">
//             <Badge className="bg-purple-100 text-purple-700 text-xs">
//               Epic
//             </Badge>
//             <span>{epic}</span>
//           </div>
//         </SelectItem>
//       ))}

//       {jiraEpics.length > 0 && (
//         <>
//           <div className="my-2 border-t" />
//           <div className="px-2 py-1.5 text-xs font-semibold text-gray-500 flex items-center space-x-1">
//             <GitBranch className="w-3 h-3" />
//             <span>JIRA Epics</span>
//           </div>
//           {jiraEpics.map((epic) => (
//             <SelectItem
//               key={epic.key}
//               value={jiraService.formatIssueAsFeature(epic)}
//             >
//               <div className="flex items-center space-x-2">
//                 <Badge className="bg-purple-100 text-purple-700 text-xs">
//                   {epic.key}
//                 </Badge>
//                 <span className="truncate">{epic.fields.summary}</span>
//               </div>
//             </SelectItem>
//           ))}
//         </>
//       )}
//     </SelectContent>
//   </Select>
// </div>;
