@ECHO OFF
set var=""
:Loop

IF "%1"=="" GOTO Continue
	%var += "%1"
SHIFT
GOTO Loop
:Continue

echo %var





