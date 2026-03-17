#!/bin/sh
# SamFlip system monitor
# Writes /system/system.json every ~5 seconds.
# Requires bind mounts:
#   /sys/class/thermal  (for CPU temperature)
#   /:/host             (for host disk usage)

OUTFILE=/system/system.json
mkdir -p /system

# ---------------------------------------------------------------------------
# CPU load: sample /proc/stat twice, 1s apart — gives accurate delta-based %
# ---------------------------------------------------------------------------
cpu_usage() {
    s1=$(awk '/^cpu / {
        idle=$5+$6; total=0
        for(i=2;i<=NF;i++) total+=$i
        print idle, total
    }' /proc/stat)

    sleep 1

    s2=$(awk '/^cpu / {
        idle=$5+$6; total=0
        for(i=2;i<=NF;i++) total+=$i
        print idle, total
    }' /proc/stat)

    printf '%s %s' "$s1" "$s2" | awk '{
        didle  = $3 - $1
        dtotal = $4 - $2
        if (dtotal > 0) printf "%.1f", (1 - didle/dtotal) * 100
        else print "0"
    }'
}

# ---------------------------------------------------------------------------
# CPU temperature: read from sysfs thermal zone (Raspberry Pi uses zone 0)
# ---------------------------------------------------------------------------
cpu_temp() {
    TFILE=/sys/class/thermal/thermal_zone0/temp
    if [ -r "$TFILE" ]; then
        awk '{printf "%.1f", $1/1000}' "$TFILE"
    else
        echo "null"
    fi
}

# ---------------------------------------------------------------------------
# Memory usage: from /proc/meminfo (reflects host — no special mount needed)
# ---------------------------------------------------------------------------
mem_pct() {
    awk '
        /MemTotal/     { total=$2 }
        /MemAvailable/ { avail=$2 }
        END { printf "%.1f", (1 - avail/total) * 100 }
    ' /proc/meminfo
}

# ---------------------------------------------------------------------------
# Disk usage: /host is the Pi root bind-mounted read-only
# ---------------------------------------------------------------------------
disk_pct() {
    df /host 2>/dev/null \
        | awk 'NR==2 { printf "%.1f", $3/($3+$4)*100 }' \
        || echo "null"
}

echo "[samflip-monitor] started — writing to $OUTFILE every ~5s"

while true; do
    CPU=$(cpu_usage)   # ~1s blocking sample
    TEMP=$(cpu_temp)
    MEM=$(mem_pct)
    DISK=$(disk_pct)
    TS=$(date +%Y-%m-%dT%H:%M:%S%z)

    printf '{"cpu_load":%s,"cpu_temp":%s,"mem_pct":%s,"disk_pct":%s,"updated":"%s"}\n' \
        "$CPU" "$TEMP" "$MEM" "$DISK" "$TS" \
        > "$OUTFILE.tmp" \
        && mv "$OUTFILE.tmp" "$OUTFILE"

    sleep 4   # +1s from cpu_usage = 5s total
done
