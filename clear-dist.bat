del /q "D:\Informatik\cognimap\dist-app\*"
FOR /D %%p IN ("D:\Informatik\cognimap\dist-app\*.*") DO rmdir "%%p" /s /q
