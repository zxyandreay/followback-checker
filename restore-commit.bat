@echo off
setlocal DisableDelayedExpansion
REM Managed by zxyandreay/restore-commit
REM Restore Commit Version: 1.0.0
REM This batch file is self-contained. It runs the embedded PowerShell payload below.

set "RESTORE_COMMIT_BAT=%~f0"
powershell.exe -NoProfile -ExecutionPolicy Bypass -Command "$ErrorActionPreference='Stop'; $path=$env:RESTORE_COMMIT_BAT; $raw=[System.IO.File]::ReadAllText($path); $marker='# POWERSHELL_PAYLOAD_START'; $idx=$raw.LastIndexOf($marker); if ($idx -lt 0) { throw 'Embedded PowerShell payload not found.' }; $script=$raw.Substring($idx + $marker.Length); & ([scriptblock]::Create($script))"
set "RESTORE_COMMIT_EXIT=%ERRORLEVEL%"
if not "%RESTORE_COMMIT_NO_PAUSE%"=="1" (
    echo.
    pause
)
exit /b %RESTORE_COMMIT_EXIT%

# POWERSHELL_PAYLOAD_START

$script:ExitCode = 0
$script:Stage = 0
$script:BackupBranch = $null
$script:SavedStash = $null
$script:PushResult = "Not attempted."
$script:RestorationCommit = $null
$script:SelfRelativePath = $null

function Write-Line {
    param(
        [string]$Label,
        [string]$Message,
        [ConsoleColor]$Color = [ConsoleColor]::Gray
    )
    if ([string]::IsNullOrWhiteSpace($Label)) {
        Write-Host $Message
    } else {
        Write-Host ("[{0}] {1}" -f $Label, $Message) -ForegroundColor $Color
    }
}

function Write-Info { param([string]$Message) Write-Line "INFO" $Message Cyan }
function Write-Ok { param([string]$Message) Write-Line "OK" $Message Green }
function Write-Warn { param([string]$Message) Write-Line "WARN" $Message Yellow }
function Write-Err { param([string]$Message) Write-Line "ERROR" $Message Red }

function Write-Stage {
    param([string]$Title)
    $script:Stage++
    Write-Host ""
    Write-Host ("[{0}] {1}" -f $script:Stage, $Title) -ForegroundColor White
    Write-Host ("-" * ([Math]::Min(72, $Title.Length + 5)))
}

function Convert-ToText {
    param($Value)
    if ($null -eq $Value) {
        return ""
    }
    return ($Value | ForEach-Object { $_.ToString() }) -join [Environment]::NewLine
}

function Invoke-Git {
    param(
        [Parameter(Mandatory=$true)][string[]]$Arguments,
        [switch]$AllowFailure
    )

    $oldPreference = $ErrorActionPreference
    $ErrorActionPreference = "Continue"
    $output = & git @Arguments 2>&1
    $code = $LASTEXITCODE
    $ErrorActionPreference = $oldPreference

    $lines = @($output | ForEach-Object { $_.ToString() })
    $text = ($lines -join [Environment]::NewLine).TrimEnd()

    if (-not $AllowFailure -and $code -ne 0) {
        throw ("git {0} failed with exit code {1}.{2}{3}" -f (($Arguments | ForEach-Object { Quote-ForDisplay $_ }) -join " "), $code, [Environment]::NewLine, $text)
    }

    return [pscustomobject]@{
        ExitCode = $code
        Output = $text
        Lines = $lines
    }
}

function Get-GitOutput {
    param([Parameter(Mandatory=$true)][string[]]$Arguments)
    $result = Invoke-Git -Arguments $Arguments
    return $result.Output.Trim()
}

function Quote-ForDisplay {
    param([string]$Value)
    if ($null -eq $Value) {
        return '""'
    }
    if ($Value -match '[\s"&|<>^()]') {
        return '"' + ($Value -replace '"','\"') + '"'
    }
    return $Value
}

function Mask-RemoteUrl {
    param([string]$Url)
    if ([string]::IsNullOrWhiteSpace($Url)) {
        return "(none)"
    }
    $masked = $Url -replace '(https?://)([^/@\s]+):([^/@\s]+)@','$1***:***@'
    $masked = $masked -replace '(https?://)([^/@\s]+)@','$1***@'
    return $masked
}

function Initialize-SelfRelativePath {
    param([string]$RepositoryRoot)

    $batchPath = $env:RESTORE_COMMIT_BAT
    if ([string]::IsNullOrWhiteSpace($batchPath)) {
        return
    }

    try {
        $repoFull = [System.IO.Path]::GetFullPath($RepositoryRoot).TrimEnd('\','/') + [System.IO.Path]::DirectorySeparatorChar
        $batchFull = [System.IO.Path]::GetFullPath($batchPath)
        if ($batchFull.StartsWith($repoFull, [System.StringComparison]::OrdinalIgnoreCase)) {
            $relative = $batchFull.Substring($repoFull.Length).Replace('\','/')
            if ($relative -eq "restore-commit.bat") {
                $script:SelfRelativePath = $relative
            }
        }
    } catch {
        $script:SelfRelativePath = $null
    }
}

function Test-SelfUntrackedStatusLine {
    param([string]$Line)
    return (-not [string]::IsNullOrWhiteSpace($script:SelfRelativePath)) -and $Line -eq ("?? {0}" -f $script:SelfRelativePath)
}

function Read-Answer {
    param([string]$Prompt)
    try {
        return Read-Host $Prompt
    } catch {
        return ""
    }
}

function Get-RawStatusLines {
    $status = Invoke-Git -Arguments @("status","--short","--untracked-files=all")
    return @($status.Lines | Where-Object { $_ -ne "" })
}

function Get-StatusLines {
    $lines = Get-RawStatusLines
    return @($lines | Where-Object { -not (Test-SelfUntrackedStatusLine $_) })
}

function Stop-WithMessage {
    param(
        [string]$Message,
        [int]$Code = 1
    )
    if ($Message) {
        Write-Err $Message
    }
    exit $Code
}

function Test-GitPathExists {
    param([string]$GitPathName)
    $path = Get-GitOutput -Arguments @("rev-parse","--git-path",$GitPathName)
    if ([string]::IsNullOrWhiteSpace($path)) {
        return $false
    }
    return Test-Path -LiteralPath $path
}

function Resolve-CommitInput {
    param([string]$Candidate)

    $verify = Invoke-Git -Arguments @("rev-parse","--verify","--quiet",("$Candidate^{commit}")) -AllowFailure
    if ($verify.ExitCode -eq 0) {
        $hash = $verify.Lines | Where-Object { $_ -match '^[0-9a-fA-F]{40,64}$' } | Select-Object -First 1
        if ($hash) {
            $type = Invoke-Git -Arguments @("cat-file","-t",$hash) -AllowFailure
            if ($type.ExitCode -eq 0 -and $type.Output.Trim() -eq "commit") {
                return [pscustomobject]@{ Success = $true; Hash = $hash.ToLowerInvariant(); Reason = "" }
            }
        }
    }

    $disambiguate = Invoke-Git -Arguments @("rev-parse",("--disambiguate=$Candidate")) -AllowFailure
    $objects = @($disambiguate.Lines | Where-Object { $_ -match '^[0-9a-fA-F]{40,64}$' })
    if ($objects.Count -gt 1) {
        return [pscustomobject]@{ Success = $false; Hash = ""; Reason = "ambiguous" }
    }

    $detail = Invoke-Git -Arguments @("rev-parse","--verify",("$Candidate^{commit}")) -AllowFailure
    if ($detail.Output -match '(?i)ambiguous') {
        return [pscustomobject]@{ Success = $false; Hash = ""; Reason = "ambiguous" }
    }

    return [pscustomobject]@{ Success = $false; Hash = ""; Reason = "notfound" }
}

function Get-CommitSummary {
    param([string]$Commit)
    return [pscustomobject]@{
        FullHash = Get-GitOutput -Arguments @("rev-parse",$Commit)
        ShortHash = Get-GitOutput -Arguments @("rev-parse","--short=12",$Commit)
        Author = Get-GitOutput -Arguments @("show","-s","--format=%an <%ae>",$Commit)
        AuthorDate = Get-GitOutput -Arguments @("show","-s","--format=%aI",$Commit)
        Subject = Get-GitOutput -Arguments @("show","-s","--format=%s",$Commit)
        Tree = Get-GitOutput -Arguments @("rev-parse",("$Commit^{tree}"))
    }
}

function New-BackupBranchName {
    param(
        [string]$Branch,
        [string]$ShortHead
    )

    $timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
    $safe = $Branch -replace '[^A-Za-z0-9_-]+','-'
    $safe = $safe -replace '-+','-'
    $safe = $safe.Trim('-')
    if ([string]::IsNullOrWhiteSpace($safe)) {
        $safe = "branch"
    }

    $base = "restore-backup/$safe-$timestamp-$ShortHead"
    $candidate = $base
    $suffix = 2
    while ((Invoke-Git -Arguments @("show-ref","--verify","--quiet",("refs/heads/$candidate")) -AllowFailure).ExitCode -eq 0) {
        $candidate = "$base-$suffix"
        $suffix++
    }

    $check = Invoke-Git -Arguments @("check-ref-format","--branch",$candidate) -AllowFailure
    if ($check.ExitCode -ne 0) {
        throw "Generated backup branch name is not valid: $candidate"
    }

    return $candidate
}

function Save-WorkingChanges {
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss K"
    $message = "Restore Commit pre-restore stash $timestamp"
    Write-Info "Saving current tracked and untracked changes in a stash."
    $stashArgs = @("stash","push","--include-untracked","-m",$message)
    if (-not [string]::IsNullOrWhiteSpace($script:SelfRelativePath)) {
        $stashArgs += @("--",".",(":(exclude){0}" -f $script:SelfRelativePath))
    }
    $stash = Invoke-Git -Arguments $stashArgs -AllowFailure
    if ($stash.ExitCode -ne 0) {
        Write-Err "Git stash failed. No restoration was attempted."
        if ($stash.Output) {
            Write-Host $stash.Output
        }
        exit 1
    }

    $list = Invoke-Git -Arguments @("stash","list","--format=%gd|%H|%s") -AllowFailure
    $first = $list.Lines | Select-Object -First 1
    if ($first -and $first -like "*$message*") {
        $parts = $first -split '\|',3
        $script:SavedStash = [pscustomobject]@{ Ref = $parts[0]; Hash = $parts[1]; Subject = $parts[2] }
        Write-Ok ("Saved stash: {0} ({1})" -f $script:SavedStash.Ref, $script:SavedStash.Hash.Substring(0,12))
    } else {
        $script:SavedStash = [pscustomobject]@{ Ref = "stash@{0}"; Hash = ""; Subject = $message }
        Write-Warn "The stash was created, but Git did not return the expected stash metadata."
    }

    $remaining = Get-StatusLines
    if ($remaining.Count -gt 0) {
        Write-Err "The working tree is still not clean after stashing. Restoration is cancelled."
        $remaining | ForEach-Object { Write-Host "  $_" }
        exit 1
    }
}

function Test-GitIdentity {
    $identity = Invoke-Git -Arguments @("var","GIT_AUTHOR_IDENT") -AllowFailure
    if ($identity.ExitCode -eq 0) {
        return $true
    }

    Write-Err "Git cannot determine the author identity needed to create a commit."
    Write-Host ""
    Write-Host "Configure your existing Git identity, then run this utility again:"
    Write-Host "  git config --global user.name " -NoNewline
    Write-Host '"Your Name"'
    Write-Host "  git config --global user.email " -NoNewline
    Write-Host '"you@example.com"'
    Write-Host ""
    Write-Host "No restoration changes were applied."
    return $false
}

function Rollback-TrackedState {
    param([string]$OriginalHead)
    Write-Warn "Attempting to restore tracked files back to the original HEAD."
    $rollback = Invoke-Git -Arguments @("read-tree","--reset","-u",$OriginalHead) -AllowFailure
    if ($rollback.ExitCode -eq 0) {
        Write-Ok "Tracked files were restored to the original HEAD."
    } else {
        Write-Err "Rollback failed. Use the backup branch and Git status output to recover."
        if ($rollback.Output) {
            Write-Host $rollback.Output
        }
    }
}

function Write-DiffPreview {
    param(
        [string]$Head,
        [string]$Target
    )

    Write-Host ""
    Write-Host "Comparison direction: current HEAD -> selected target tree"
    Write-Host "These are the tracked-file changes that will be staged by the restore."
    Write-Host ""

    $stat = Invoke-Git -Arguments @("diff","--stat",$Head,$Target,"--") -AllowFailure
    Write-Host "Diff summary:"
    if ($stat.Output) { Write-Host $stat.Output } else { Write-Host "  (no diff stat)" }
    Write-Host ""

    $nameStatus = Invoke-Git -Arguments @("diff","--name-status",$Head,$Target,"--") -AllowFailure
    Write-Host "File status:"
    if ($nameStatus.Output) { Write-Host $nameStatus.Output } else { Write-Host "  (no file changes)" }
    Write-Host ""

    $summary = Invoke-Git -Arguments @("diff","--summary",$Head,$Target,"--") -AllowFailure
    Write-Host "Structural summary:"
    if ($summary.Output) { Write-Host $summary.Output } else { Write-Host "  (no structural changes)" }
}

function Write-CompletionSummary {
    param(
        [string]$Repository,
        [string]$Branch,
        [string]$PreviousHead,
        [string]$TargetHash,
        [string]$NewCommit
    )

    Write-Stage "Completion summary"
    Write-Host ("Repository:                {0}" -f $Repository)
    Write-Host ("Branch:                    {0}" -f $Branch)
    Write-Host ("Previous commit:           {0}" -f $PreviousHead)
    Write-Host ("Restored source commit:    {0}" -f $TargetHash)
    Write-Host ("New restoration commit:    {0}" -f $NewCommit)
    Write-Host ("Backup branch:             {0}" -f $script:BackupBranch)
    if ($script:SavedStash) {
        Write-Host ("Saved stash:               {0} {1}" -f $script:SavedStash.Ref, $script:SavedStash.Hash)
    } else {
        Write-Host "Saved stash:               (none)"
    }
    Write-Host ("Push result:               {0}" -f $script:PushResult)

    $status = Get-StatusLines
    if ($status.Count -eq 0) {
        Write-Host "Working tree clean:        yes"
    } else {
        Write-Host "Working tree clean:        no"
        $status | ForEach-Object { Write-Host "  $_" }
    }

    Write-Host ""
    Write-Host "Helpful recovery commands:"
    Write-Host ("  git log {0}" -f (Quote-ForDisplay $script:BackupBranch))
    Write-Host ("  Run restore-commit.bat again and enter {0} to create a history-preserving return commit." -f $PreviousHead)
    if ($script:SavedStash) {
        Write-Host "  git stash list"
        Write-Host ("  git stash apply {0}" -f $script:SavedStash.Ref)
    }
}

function Push-RestorationCommit {
    param(
        [string]$Branch,
        [bool]$OriginExists
    )

    if (-not $OriginExists) {
        $script:PushResult = "No origin remote is configured. No push was performed."
        Write-Warn $script:PushResult
        Write-Host "You can add a remote later with:"
        Write-Host "  git remote add origin <url>"
        Write-Host ("  git push -u origin {0}" -f (Quote-ForDisplay $Branch))
        return
    }

    $upstream = Invoke-Git -Arguments @("rev-parse","--abbrev-ref","--symbolic-full-name","@{u}") -AllowFailure
    if ($upstream.ExitCode -eq 0 -and -not [string]::IsNullOrWhiteSpace($upstream.Output)) {
        Write-Info ("Pushing the new commit to upstream {0}." -f $upstream.Output.Trim())
        $push = Invoke-Git -Arguments @("push") -AllowFailure
        if ($push.ExitCode -eq 0) {
            $script:PushResult = "Pushed successfully with git push."
            Write-Ok $script:PushResult
        } else {
            $script:PushResult = "Push failed. The restore commit exists locally."
            Write-Err $script:PushResult
            Write-Host "Retry later with:"
            Write-Host "  git push"
            if ($push.Output) {
                Write-Host ""
                Write-Host "Git output:"
                Write-Host (Mask-RemoteUrl $push.Output)
            }
            $script:ExitCode = 1
        }
        return
    }

    Write-Warn "The current branch has no upstream branch."
    Write-Host ("To publish it to origin, this utility can run: git push -u origin {0}" -f (Quote-ForDisplay $Branch))
    $publish = Read-Answer "Type PUBLISH to run that command, or press Enter to keep the commit local"
    if ($publish -ne "PUBLISH") {
        $script:PushResult = "No upstream configured. User chose not to publish."
        Write-Info $script:PushResult
        return
    }

    $pushSetUpstream = Invoke-Git -Arguments @("push","-u","origin",$Branch) -AllowFailure
    if ($pushSetUpstream.ExitCode -eq 0) {
        $script:PushResult = ("Pushed successfully with git push -u origin {0}." -f $Branch)
        Write-Ok $script:PushResult
    } else {
        $script:PushResult = "Push failed. The restore commit exists locally."
        Write-Err $script:PushResult
        Write-Host "Retry later with:"
        Write-Host ("  git push -u origin {0}" -f (Quote-ForDisplay $Branch))
        if ($pushSetUpstream.Output) {
            Write-Host ""
            Write-Host "Git output:"
            Write-Host (Mask-RemoteUrl $pushSetUpstream.Output)
        }
        $script:ExitCode = 1
    }
}

try {
    Write-Host ""
    Write-Host "Restore Commit" -ForegroundColor White
    Write-Host "Safely restore tracked files to an earlier commit without rewriting history."

    Write-Stage "Startup validation"
    if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
        Stop-WithMessage "Git was not found in PATH. Install Git for Windows and try again." 1
    }
    Write-Ok "Git is available."

    $inside = Invoke-Git -Arguments @("rev-parse","--is-inside-work-tree") -AllowFailure
    if ($inside.ExitCode -ne 0 -or $inside.Output.Trim() -ne "true") {
        Stop-WithMessage "This file must be run from inside a Git working repository." 1
    }

    $repoRoot = Get-GitOutput -Arguments @("rev-parse","--show-toplevel")
    Set-Location -LiteralPath $repoRoot
    Initialize-SelfRelativePath -RepositoryRoot $repoRoot

    $headCheck = Invoke-Git -Arguments @("rev-parse","--verify","HEAD^{commit}") -AllowFailure
    if ($headCheck.ExitCode -ne 0) {
        Stop-WithMessage "This repository does not have any commits yet." 1
    }

    $branchResult = Invoke-Git -Arguments @("symbolic-ref","--quiet","--short","HEAD") -AllowFailure
    if ($branchResult.ExitCode -ne 0 -or [string]::IsNullOrWhiteSpace($branchResult.Output)) {
        Stop-WithMessage "Detached HEAD detected. Check out a branch before running Restore Commit." 1
    }
    $branch = $branchResult.Output.Trim()

    $unfinished = New-Object System.Collections.Generic.List[string]
    if (Test-GitPathExists "MERGE_HEAD") { [void]$unfinished.Add("merge") }
    if (Test-GitPathExists "rebase-merge") { [void]$unfinished.Add("rebase") }
    if (Test-GitPathExists "rebase-apply") { [void]$unfinished.Add("rebase") }
    if (Test-GitPathExists "CHERRY_PICK_HEAD") { [void]$unfinished.Add("cherry-pick") }
    if (Test-GitPathExists "REVERT_HEAD") { [void]$unfinished.Add("revert") }
    if ($unfinished.Count -gt 0) {
        Stop-WithMessage ("An unfinished Git operation is in progress: {0}. Finish or abort it first." -f (($unfinished | Select-Object -Unique) -join ", ")) 1
    }

    $headFull = Get-GitOutput -Arguments @("rev-parse","HEAD")
    $headShort = Get-GitOutput -Arguments @("rev-parse","--short=12","HEAD")
    $headSubject = Get-GitOutput -Arguments @("log","-1","--pretty=%s")
    $originResult = Invoke-Git -Arguments @("remote","get-url","origin") -AllowFailure
    $originExists = $originResult.ExitCode -eq 0 -and -not [string]::IsNullOrWhiteSpace($originResult.Output)
    $originDisplay = if ($originExists) { Mask-RemoteUrl $originResult.Output.Trim() } else { "(none)" }

    Write-Host ("Repository folder:         {0}" -f $repoRoot)
    Write-Host ("Current branch:            {0}" -f $branch)
    Write-Host ("Current commit:            {0}" -f $headShort)
    Write-Host ("Current commit subject:    {0}" -f $headSubject)
    Write-Host ("Configured origin remote:  {0}" -f $originDisplay)
    if (-not $originExists) {
        Write-Warn "No origin remote is configured. A local restore commit can still be created, but no push will be performed."
    }

    Write-Stage "Working-tree safety"
    $rawStatusLines = Get-RawStatusLines
    $statusLines = Get-StatusLines
    $stashRequested = $false
    $ignoredSelf = @($rawStatusLines | Where-Object { Test-SelfUntrackedStatusLine $_ })
    if ($ignoredSelf.Count -gt 0) {
        Write-Info "Ignoring the untracked restore-commit.bat helper file itself."
    }
    if ($statusLines.Count -gt 0) {
        Write-Warn "Working-tree changes were found. They will not be discarded silently."
        $statusLines | ForEach-Object { Write-Host "  $_" }
        Write-Host ""
        Write-Host "Choose one:"
        Write-Host "  1. Abort without changing anything"
        Write-Host "  2. Save all current changes, including untracked files, in a stash and continue"
        $choice = Read-Answer "Enter 1 or 2"
        if ($choice -ne "2") {
            Stop-WithMessage "Cancelled before any restoration changes were made." 2
        }
        $stashRequested = $true
        Write-Info "A stash will be created only after the final RESTORE confirmation."
    } else {
        Write-Ok "The working tree has no tracked or untracked changes."
    }

    Write-Stage "Commit input and validation"
    $targetFull = $null
    while (-not $targetFull) {
        $rawInput = Read-Answer "Enter the target commit hash, or press Enter to cancel"
        $candidate = ""
        if ($null -ne $rawInput) {
            $candidate = $rawInput.Trim()
        }

        if ([string]::IsNullOrWhiteSpace($candidate)) {
            Stop-WithMessage "Cancelled. No restoration changes were made." 2
        }

        if ($candidate -notmatch '^[0-9a-fA-F]+$') {
            Write-Err "The commit value must contain only hexadecimal characters."
            continue
        }

        if ($candidate.Length -lt 7) {
            Write-Err "Enter at least 7 hexadecimal characters."
            continue
        }

        if ($candidate.Length -gt 64) {
            Write-Err "The entered hash is longer than Git commit hashes supported by this utility."
            continue
        }

        $resolved = Resolve-CommitInput -Candidate $candidate
        if ($resolved.Success) {
            $targetFull = $resolved.Hash
            break
        }

        if ($resolved.Reason -eq "ambiguous") {
            Write-Err "That abbreviated hash is ambiguous. Enter more characters or the full hash."
            continue
        }

        Write-Warn "That commit was not found locally."
        if ($originExists) {
            $fetch = Read-Answer "Type FETCH to fetch origin and retry, or press Enter to enter a different hash"
            if ($fetch -eq "FETCH") {
                Write-Info "Fetching origin."
                $fetchResult = Invoke-Git -Arguments @("fetch","origin") -AllowFailure
                if ($fetchResult.ExitCode -ne 0) {
                    Write-Err "Fetch failed."
                    if ($fetchResult.Output) { Write-Host (Mask-RemoteUrl $fetchResult.Output) }
                    continue
                }
                $resolvedAfterFetch = Resolve-CommitInput -Candidate $candidate
                if ($resolvedAfterFetch.Success) {
                    $targetFull = $resolvedAfterFetch.Hash
                    break
                }
                Write-Err "The commit still could not be resolved after fetching origin."
            }
        }
    }

    $target = Get-CommitSummary -Commit $targetFull
    $head = Get-CommitSummary -Commit "HEAD"

    $ancestor = Invoke-Git -Arguments @("merge-base","--is-ancestor",$target.FullHash,"HEAD") -AllowFailure
    $targetIsAncestor = $ancestor.ExitCode -eq 0
    if (-not $targetIsAncestor) {
        Write-Warn "The selected commit is not an ancestor of the current HEAD."
    }

    Write-Stage "Selected commit preview"
    Write-Host ("Full commit hash:          {0}" -f $target.FullHash)
    Write-Host ("Abbreviated commit hash:   {0}" -f $target.ShortHash)
    Write-Host ("Author:                    {0}" -f $target.Author)
    Write-Host ("Author date:               {0}" -f $target.AuthorDate)
    Write-Host ("Commit subject:            {0}" -f $target.Subject)
    Write-Host ("Current HEAD hash:         {0}" -f $head.FullHash)
    Write-Host ("Current branch:            {0}" -f $branch)
    Write-Host ("Target ancestor of HEAD:   {0}" -f ($(if ($targetIsAncestor) { "yes" } else { "no" })))
    Write-Host ("Current tree hash:         {0}" -f $head.Tree)
    Write-Host ("Target tree hash:          {0}" -f $target.Tree)

    $affectedFiles = @(Invoke-Git -Arguments @("diff","--name-only","HEAD",$target.FullHash,"--") -AllowFailure).Lines
    $affectedFiles = @($affectedFiles | Where-Object { $_ -ne "" })
    Write-Host ("Affected file count:       {0}" -f $affectedFiles.Count)

    Write-DiffPreview -Head "HEAD" -Target $target.FullHash

    Write-Stage "No-change check"
    if ($head.Tree -eq $target.Tree) {
        Write-Ok "The current HEAD tree already matches the selected commit tree."
        Write-Host "No restoration commit was created and no push was performed."
        if ($stashRequested) {
            Write-Host "The pending stash was not created because no restore was needed."
        }
        exit 0
    }
    Write-Ok "The tracked-file trees differ. A restoration commit can be created."

    Write-Stage "Final confirmation"
    if (-not (Test-GitIdentity)) {
        exit 1
    }

    $script:BackupBranch = New-BackupBranchName -Branch $branch -ShortHead $headShort
    $upstreamCheck = Invoke-Git -Arguments @("rev-parse","--abbrev-ref","--symbolic-full-name","@{u}") -AllowFailure
    $pushPlan = "No push; origin is not configured."
    if ($originExists -and $upstreamCheck.ExitCode -eq 0 -and -not [string]::IsNullOrWhiteSpace($upstreamCheck.Output)) {
        $pushPlan = ("Normal push to upstream {0} will be attempted." -f $upstreamCheck.Output.Trim())
    } elseif ($originExists) {
        $pushPlan = "No upstream is configured; publishing to origin will be offered after the commit."
    }

    Write-Warn "This will restore Git-tracked project files to the selected commit tree."
    Write-Host ("Current branch:            {0}" -f $branch)
    Write-Host ("Current commit:            {0}" -f $head.FullHash)
    Write-Host ("Target commit:             {0}" -f $target.FullHash)
    Write-Host ("Affected files:            {0}" -f $affectedFiles.Count)
    Write-Host ("Backup branch to create:   {0}" -f $script:BackupBranch)
    Write-Host ("Push plan:                 {0}" -f $pushPlan)
    if ($stashRequested) {
        Write-Host "Local changes:             Will be saved in a stash before the restore."
    }
    Write-Host ""
    $confirm = Read-Answer "Type RESTORE to proceed"
    if ($confirm -ne "RESTORE") {
        Stop-WithMessage "Cancelled. No restoration changes were made." 2
    }

    Write-Stage "Backup and restore"
    if ($stashRequested) {
        Save-WorkingChanges
    }

    Write-Info ("Creating local backup branch {0} at {1}." -f $script:BackupBranch, $head.FullHash)
    $backup = Invoke-Git -Arguments @("branch",$script:BackupBranch,$head.FullHash) -AllowFailure
    if ($backup.ExitCode -ne 0) {
        Write-Err "Backup branch creation failed. No restoration was attempted."
        if ($backup.Output) { Write-Host $backup.Output }
        exit 1
    }
    Write-Ok "Backup branch created."

    Write-Info ("Restoring tracked files from {0} while keeping HEAD on {1}." -f $target.ShortHash, $branch)
    $readTree = Invoke-Git -Arguments @("read-tree","--reset","-u",$target.FullHash) -AllowFailure
    if ($readTree.ExitCode -ne 0) {
        Write-Err "Tree restoration failed. Attempting rollback to the original HEAD."
        if ($readTree.Output) { Write-Host $readTree.Output }
        Rollback-TrackedState -OriginalHead $head.FullHash
        exit 1
    }

    $indexTree = Get-GitOutput -Arguments @("write-tree")
    if ($indexTree -ne $target.Tree) {
        Write-Err "Verification failed: the index tree does not match the selected commit tree."
        Write-Host ("Expected: {0}" -f $target.Tree)
        Write-Host ("Actual:   {0}" -f $indexTree)
        Rollback-TrackedState -OriginalHead $head.FullHash
        exit 1
    }
    Write-Ok "Verified: the staged tree matches the selected commit tree."

    Write-Stage "Restoration commit"
    $cachedStat = Invoke-Git -Arguments @("diff","--cached","--stat") -AllowFailure
    Write-Host "Staged change summary:"
    if ($cachedStat.Output) { Write-Host $cachedStat.Output } else { Write-Host "  (no staged diff stat)" }
    Write-Host ""
    $cachedStatus = Invoke-Git -Arguments @("diff","--cached","--name-status") -AllowFailure
    if ($cachedStatus.Output) {
        Write-Host $cachedStatus.Output
    }

    $hasStaged = Invoke-Git -Arguments @("diff","--cached","--quiet") -AllowFailure
    if ($hasStaged.ExitCode -eq 0) {
        Write-Err "No staged changes were found. No commit will be created."
        Rollback-TrackedState -OriginalHead $head.FullHash
        exit 1
    }

    $commitSubject = "restore: restore project state from $($target.ShortHash)"
    $commitMessage = @"
$commitSubject

Restores tracked project files to the tree from:
$($target.FullHash)

Source commit: $($target.Subject)
Previous HEAD: $($head.FullHash)
Current branch: $branch
Generated by Restore Commit.
"@

    $messagePath = Join-Path ([System.IO.Path]::GetTempPath()) ("restore-commit-message-{0}.txt" -f ([System.Guid]::NewGuid().ToString("N")))
    $utf8NoBom = New-Object System.Text.UTF8Encoding -ArgumentList $false
    [System.IO.File]::WriteAllText($messagePath, $commitMessage, $utf8NoBom)
    try {
        $commit = Invoke-Git -Arguments @("commit","-F",$messagePath) -AllowFailure
    } finally {
        Remove-Item -LiteralPath $messagePath -Force -ErrorAction SilentlyContinue
    }

    if ($commit.ExitCode -ne 0) {
        Write-Err "The restore tree is staged, but Git could not create the commit."
        Write-Host "The repository is recoverable:"
        Write-Host ("  git status")
        Write-Host ("  git commit -m {0}" -f (Quote-ForDisplay $commitSubject))
        Write-Host ("  git read-tree --reset -u {0}" -f $head.FullHash)
        if ($commit.Output) {
            Write-Host ""
            Write-Host "Git output:"
            Write-Host $commit.Output
        }
        exit 1
    }

    $script:RestorationCommit = Get-GitOutput -Arguments @("rev-parse","HEAD")
    Write-Ok ("Created restoration commit {0}." -f $script:RestorationCommit)

    Write-Stage "Push handling"
    Push-RestorationCommit -Branch $branch -OriginExists $originExists

    Write-CompletionSummary -Repository $repoRoot -Branch $branch -PreviousHead $head.FullHash -TargetHash $target.FullHash -NewCommit $script:RestorationCommit
    exit $script:ExitCode
} catch {
    Write-Err $_.Exception.Message
    exit 1
}
