import React, { useMemo, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { ToolBar } from "../../../utils/general";
import { partitionProfile, toolText } from "../../../data/arg/remote";
import "./assets/arg-tools.scss";

// 分区修复：把未挂载的卷挂到盘符上。
// 挂载后 D: 才会出现在文件管理器里；在那之前 D: 节点被 requires 过滤掉。
export const PartitionManager = () => {
  const wnapp = useSelector((state) => state.apps.settings);
  const arg = useSelector((state) => state.arg);
  const dispatch = useDispatch();

  const hostId = arg.host || "chenmo";
  const profile = useMemo(
    () => partitionProfile(hostId, arg),
    [hostId, arg],
  );

  const [scanning, setScanning] = useState(false);
  const [mounted, setMounted] = useState(false);

  const canMount = !!profile.unallocated;

  const scan = () => {
    if (scanning) return;
    setScanning(true);
    setTimeout(() => setScanning(false), 800);
  };

  const mount = () => {
    if (!canMount || mounted) return;
    setMounted(true);
    dispatch({
      type: "ARG_FLAG",
      payload: { flag: "partitionMounted", value: true },
    });
  };

  return (
    <div
      className="arg-win arg-tool arg-partition floatTab dpShad"
      data-size={wnapp.size}
      data-max={wnapp.max}
      style={{
        ...(wnapp.size == "cstm" ? wnapp.dim : null),
        zIndex: wnapp.z,
      }}
      data-hide={wnapp.hide}
      id={wnapp.icon + "App"}
    >
      <ToolBar
        app={wnapp.action}
        icon={wnapp.icon}
        size={wnapp.size}
        name={toolText.partitionTitle}
      />

      <div className="windowScreen flex flex-col" data-dock="true">
        <div className="arg-app-toolbar">
          <span>{profile.assetId}</span>
          <span className="arg-app-count">
            {profile.volumes.length} 个卷
          </span>
        </div>

        <div className="arg-app-body arg-tool-body">
          <div className="arg-tool-section">{profile.assetId} · 卷</div>

          <div className="arg-tool-volumes">
            {profile.volumes.map((volume) => (
              <div key={volume.drive} className="arg-tool-volume" data-ok="true">
                <div className="arg-tool-volume-top">
                  <span className="arg-tool-volume-drive">{volume.drive}</span>
                  <span className="arg-tool-volume-label">{volume.status}</span>
                  <span className="arg-tool-volume-size">{volume.size}</span>
                </div>
                <div className="arg-tool-volume-meta">{volume.fs}</div>
              </div>
            ))}

            {profile.unallocated ? (
              <div className="arg-tool-volume" data-ok="false">
                <div className="arg-tool-volume-top">
                  <span className="arg-tool-volume-drive">—</span>
                  <span className="arg-tool-volume-label">未挂载</span>
                  <span className="arg-tool-volume-size">
                    {profile.unallocated}
                  </span>
                </div>
                <div className="arg-tool-volume-meta">NTFS · 无盘符</div>
              </div>
            ) : null}
          </div>

          <div className="arg-tool-note">{profile.note}</div>

          <div className="arg-tool-actions">
            <button
              type="button"
              className="arg-tool-btn"
              onClick={scan}
              disabled={scanning}
            >
              {scanning ? toolText.assetScanning : toolText.partitionScan}
            </button>

            {canMount ? (
              <button
                type="button"
                className="arg-tool-btn arg-tool-btn-primary"
                onClick={mount}
                disabled={mounted}
              >
                {mounted ? "已挂载" : toolText.partitionMount}
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PartitionManager;
