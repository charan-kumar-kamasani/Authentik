const fs = require('fs');
const path = './src/pages/admin/GenerateBlankQrs.jsx';
let content = fs.readFileSync(path, 'utf8');

// 1. Add state
const stateInsert = `  const [expandedBatch, setExpandedBatch] = useState(null);
  const [batchAssignments, setBatchAssignments] = useState({});
  const [loadingAssignments, setLoadingAssignments] = useState({});`;
  
content = content.replace("const [showAssignModal, setShowAssignModal] = useState(false);", 
  "const [showAssignModal, setShowAssignModal] = useState(false);\n" + stateInsert);

// 2. Add fetch function
const fetchFunc = `
  const handleToggleBatch = async (batchId) => {
    if (expandedBatch === batchId) {
      setExpandedBatch(null);
      return;
    }
    setExpandedBatch(batchId);
    if (!batchAssignments[batchId]) {
      setLoadingAssignments(prev => ({ ...prev, [batchId]: true }));
      try {
        const res = await fetch(\`\${API_BASE_URL}/admin/blank-qr-batches/\${batchId}/assignments\`, {
          headers: { Authorization: \`Bearer \${token}\` }
        });
        if (res.ok) {
          const data = await res.json();
          setBatchAssignments(prev => ({ ...prev, [batchId]: data }));
        }
      } catch (err) {
        console.error("Failed to fetch assignments", err);
      } finally {
        setLoadingAssignments(prev => ({ ...prev, [batchId]: false }));
      }
    }
  };
`;

content = content.replace("useEffect(() => {", fetchFunc + "\n  useEffect(() => {");

// 3. Update table rendering
// Find the `batches.map((batch) => (` block
const replaceBlockStart = `batches.map((batch) => (
                    <tr key={batch._id} className="hover:bg-slate-50 transition-colors group">`;
                    
const newBlockStart = `batches.map((batch) => {
                    const isExpanded = expandedBatch === batch._id;
                    const assignments = batchAssignments[batch._id] || [];
                    const isLoading = loadingAssignments[batch._id];
                    return (
                    <React.Fragment key={batch._id}>
                    <tr className="hover:bg-slate-50 transition-colors group cursor-pointer" onClick={() => handleToggleBatch(batch._id)}>`;

content = content.replace(replaceBlockStart, newBlockStart);

// Now find the end of the row
const rowEndStr = `                          <ExternalLink size={16} />
                          View
                        </button>
                      </td>
                    </tr>`;
const newRowEndStr = `                          <ExternalLink size={16} />
                          View
                        </button>
                      </td>
                    </tr>
                    {isExpanded && (
                      <tr className="bg-slate-50/50">
                        <td colSpan="6" className="p-0 border-b border-slate-100">
                          <div className="p-6 animate-in slide-in-from-top-2 duration-200">
                            <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-4">Company Assignments</h4>
                            {isLoading ? (
                              <div className="flex items-center gap-2 text-sm text-slate-500">
                                <div className="w-4 h-4 border-2 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
                                Loading assignments...
                              </div>
                            ) : assignments.length === 0 ? (
                              <div className="text-sm text-slate-500 italic">No QRs from this batch have been assigned to any company yet.</div>
                            ) : (
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {assignments.map((seg, idx) => (
                                  <div key={idx} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col gap-2">
                                    <div className="font-bold text-slate-800 text-sm">{seg.company?.companyName || 'Unknown Company'}</div>
                                    <div className="flex items-center gap-2 font-mono text-xs bg-slate-100 px-2 py-1 rounded text-slate-600 w-fit">
                                      <span className="font-semibold">{formatSN(seg.startSerialNumber)}</span>
                                      <span className="text-slate-400">➔</span>
                                      <span className="font-semibold">{formatSN(seg.endSerialNumber)}</span>
                                    </div>
                                    <div className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded w-fit">
                                      {seg.count.toLocaleString()} QRs Assigned
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                    </React.Fragment>
`;

// Note: there are two map functions. We only want to replace the first rowEndStr in the history tab.
const parts = content.split(rowEndStr);
content = parts[0] + newRowEndStr + parts.slice(1).join(rowEndStr);

content = content.replace("</React.Fragment>\n                  ))", "</React.Fragment>\n                  )})");

fs.writeFileSync(path, content, 'utf8');
console.log("Patched GenerateBlankQrs.jsx");
