[0;1;32m●[0m nginx.service - A high performance web server and a reverse proxy server
     Loaded: loaded (]8;;file://6312597-by305349/usr/lib/systemd/system/nginx.service/usr/lib/systemd/system/nginx.service]8;;; [0;1;32menabled[0m; preset: [0;1;32menabled[0m)
     Active: [0;1;32mactive (running)[0m since Sat 2025-12-27 18:23:42 UTC; 4s ago
       Docs: ]8;;man:nginx(8)man:nginx(8)]8;;
    Process: 11904 ExecStartPre=/usr/sbin/nginx -t -q -g daemon on; master_process on; (code=exited, status=0/SUCCESS)
    Process: 11906 ExecStart=/usr/sbin/nginx -g daemon on; master_process on; (code=exited, status=0/SUCCESS)
   Main PID: 11907 (nginx)
      Tasks: 3 (limit: 2315)
     Memory: 2.8M (peak: 3.0M)
        CPU: 25ms
     CGroup: /system.slice/nginx.service
             ├─[0;38;5;245m11907 "nginx: master process /usr/sbin/nginx -g daemon on; master_process on;"[0m
             ├─[0;38;5;245m11908 "nginx: worker process"[0m
             └─[0;38;5;245m11909 "nginx: worker process"[0m

Dec 27 18:23:42 6312597-by305349 systemd[1]: Starting nginx.service - A high performance web server and a reverse proxy server...
Dec 27 18:23:42 6312597-by305349 systemd[1]: Started nginx.service - A high performance web server and a reverse proxy server.
