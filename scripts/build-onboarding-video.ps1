$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $PSScriptRoot
$assets = Join-Path $root "client/public/manus-storage"
$output = Join-Path $assets "autoapply-onboarding-walkthrough.mp4"
$font = "C\:/Windows/Fonts/segoeuib.ttf"
$fontRegular = "C\:/Windows/Fonts/segoeui.ttf"

$images = @(
  (Join-Path $assets "autoapply-hero-operations_ad007abc.jpg"),
  (Join-Path $assets "autoapply-desk_635170b2.jpg"),
  (Join-Path $assets "autoapply-flow_6c03602a.jpg"),
  (Join-Path $assets "autoapply-hero-operations_ad007abc.jpg"),
  (Join-Path $assets "autoapply-desk_635170b2.jpg"),
  (Join-Path $assets "autoapply-hero-operations_ad007abc.jpg"),
  (Join-Path $assets "autoapply-flow_6c03602a.jpg"),
  (Join-Path $assets "autoapply-hero-poster_38be584c.jpg")
)

$captions = @(
  @("A CLEARER JOB SEARCH IN SAUDI ARABIA", "From sign-up to approved application.", "AUTOAPPLY SA"),
  @("1  CREATE YOUR ACCOUNT", "Choose Google or email. Your dashboard is private to you.", "ONBOARDING"),
  @("2  BUILD YOUR CAMPAIGN", "Upload your CV. Choose city, industry, seniority, and language.", "YOUR DIRECTION"),
  @("3  MATCH AND PREPARE", "We find relevant openings and prepare each application for review.", "PREPARATION"),
  @("4  REVIEW BEFORE SENDING", "See the employer, role, link, and tailored materials. Skip anything you do not want.", "YOUR CONTROL"),
  @("5  APPROVE AND TRACK", "Only approved applications are sent. Follow status from your dashboard.", "VISIBILITY"),
  @("WHAT YOUR PLAN COVERS", "Starter 99 SAR/mo ~40 apps | Pro 149 ~90 | Founder 249 ~150", "CAPACITY IS INDICATIVE. CONFIRM SCOPE BEFORE PAYMENT."),
  @("READY WHEN YOU ARE", "Sign up at app.hsndm.tech and start with your CV and target roles.", "NO HIRING OR INTERVIEW GUARANTEE")
)

$inputs = @()
foreach ($image in $images) {
  $inputs += @("-loop", "1", "-t", "4.5", "-i", $image)
}

$filters = @()
for ($i = 0; $i -lt $images.Count; $i++) {
  $title = $captions[$i][0].Replace("'", "\\'")
  $subtitle = $captions[$i][1].Replace("'", "\\'")
  $label = $captions[$i][2].Replace("'", "\\'")
  $filters += "[${i}:v]scale=1280:720:force_original_aspect_ratio=increase,crop=1280:720,setsar=1,format=yuv420p,fade=t=in:st=0:d=0.35,fade=t=out:st=4.1:d=0.4,drawbox=x=0:y=0:w=1280:h=720:color=black@0.28:t=fill,drawbox=x=64:y=70:w=650:h=575:color=black@0.72:t=fill,drawtext=fontfile='$font':text='AUTOAPPLY SA':fontcolor=#f04a31:fontsize=20:x=96:y=100,drawtext=fontfile='$font':text='$title':fontcolor=#f5f2eb:fontsize=34:line_spacing=8:x=96:y=190:enable='between(t,0.2,4.3)',drawtext=fontfile='$fontRegular':text='$subtitle':fontcolor=#f5f2eb:fontsize=22:line_spacing=8:x=96:y=315:enable='between(t,0.4,4.1)',drawtext=fontfile='$font':text='$label':fontcolor=#f04a31:fontsize=14:x=96:y=570[v$i]"
}

$concat = ($filters | ForEach-Object { "[v$($_.Substring(1, $_.IndexOf(']') - 1))]" }) -join ""
$filterComplex = ($filters -join ";") + ";" + ($images | ForEach-Object -Begin { $labels = @() } -Process { $index = $labels.Count; $labels += "[v$index]" } -End { ($labels -join "") + "concat=n=$($images.Count):v=1:a=0[outv]" })

& ffmpeg.exe @inputs -filter_complex $filterComplex -map "[outv]" -an -c:v libx264 -preset medium -crf 25 -pix_fmt yuv420p -movflags +faststart -y $output
if ($LASTEXITCODE -ne 0) { throw "FFmpeg failed with exit code $LASTEXITCODE" }
Write-Output "Created $output"
