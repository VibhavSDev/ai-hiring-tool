export const exportComparisonToCSV = (comparisonList, baseRun, targetRun) => {
    // 1. Safe Fallbacks for Weights and Dates
    const getWeightSummary = (run) => {
        const w = run?.jobInfo?.weights || { skill: 0.5, experience: 0.3, semantic: 0.2 };
        return `SKL:${Math.round(w.skill * 100)}%, EXP:${Math.round(w.experience * 100)}%, SEM:${Math.round(w.semantic * 100)}%`;
    };

    const getDateString = (dateVal) => {
        try {
            return dateVal ? new Date(dateVal).toLocaleDateString() : "N/A";
        } catch {
            return "N/A";
        }
    };

    const baseTitle = baseRun?.jobInfo?.title || "Base_Job";
    const targetTitle = targetRun?.jobInfo?.title || "Target_Job";

    // 2. Prepare Metadata Header
    const headers = [
        ["COMPARISON REPORT"],
        [`Generated: ${new Date().toLocaleString()}`],
        [`Base Run (A): ${getDateString(baseRun?.jobInfo?.createdAt)} (${getWeightSummary(baseRun)})`],
        [`Target Run (B): ${getDateString(targetRun?.jobInfo?.createdAt)} (${getWeightSummary(targetRun)})`],
        [], // Spacer
        ["Candidate Name", "Email", "Run A Rank", "Run B Rank", "Net Movement", "Score A (%)", "Score B (%)", "Status"]
    ];

    // 3. Map Data Rows safely
    const rows = (comparisonList || []).map(c => [
        c.name || "Unknown",
        c.email || "N/A",
        c.baseRank ?? "-",
        c.targetRank ?? "-",
        c.rankDelta > 0 ? `+${c.rankDelta}` : (c.rankDelta ?? 0),
        typeof c.baseScore === "number" ? c.baseScore.toFixed(2) : "0.00",
        typeof c.targetScore === "number" ? c.targetScore.toFixed(2) : "0.00",
        (c.status || "new").toUpperCase()
    ]);

    // 4. Convert to CSV String
    const csvContent = headers.concat(rows)
        .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(","))
        .join("\n");

    // 5. Trigger Download
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Comparison_Report_${baseTitle.replace(/\s+/g, '_')}_vs_${targetTitle.replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url); // Clean up memory leak
};

export const exportJobsToCSV = (jobsList) => {
    // 1. Prepare Metadata Header
    const headers = [
        ["JOB POSITIONS REPORT"],
        [`Generated: ${new Date().toLocaleString()}`],
        [], // Spacer
        ["Job Title", "Department", "Status", "Candidates Count", "Created Date"]
    ];

    // 2. Map Data Rows safely
    const rows = (jobsList || []).map(job => {
        const title = job.title || job.parsed?.title || "Untitled Position";
        const department = job.department || job.parsed?.employment_type || "General";
        const status = job.status || "Active";
        const candidatesCount = job.candidatesCount ?? job.candidates?.length ?? 0;
        
        let createdDate = "N/A";
        try {
            createdDate = job.createdAt ? new Date(job.createdAt).toLocaleDateString() : "N/A";
        } catch {
            createdDate = "N/A";
        }

        return [
            title,
            department,
            status.toUpperCase(),
            candidatesCount,
            createdDate
        ];
    });

    // 3. Convert to CSV String with safe quote escaping
    const csvContent = headers.concat(rows)
        .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(","))
        .join("\n");

    // 4. Trigger Download
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Jobs_Export_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url); // Prevent memory leaks
};