import React, { useMemo, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { ToolBar } from "../../../utils/general";
import {
  assetProfile,
  toolText,
} from "../../../data/arg/remote";
import { machines } from "../../../data/arg/config";
import "./assets/arg-tools.scss";

// 资产盘点：只读的磁盘清单，和资产平台上登记的内容对照。
// 扫描不会解锁任何东西，它只是把「登记了一个 C 盘」变成「还有一个没登记的卷」。
export const AssetManager = () => {
  const wnapp = useSelector((state) => state.apps.taskmanager);
  const arg = useSelector((state) => state.arg);
  const dispatch = useDispatch();

  const hostId = arg.host || "chenmo";
  const machine = machines[hostId] || machines.chenmo;
  const profile = useMemo(
    () => assetProfile(hostId, arg),
    [hostId, arg],
  );

  const [scanning, setScanning] = useState(false);

  const scan = () => {
    if (scanning) return;
    setScanning(true);
    setTimeout(() => {
      setScanning(false);
      dispatch({
        type: "ARG_FLAG",
        payload: { flag: "assetScanned", value: true },
      });
    }, 900);
  };

  return (
    <div
      className="arg-win arg-tool arg-asset floatTab dpShad"
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
        name={toolText.assetTitle}
      />

      <div className="windowScreen flex flex-col" data-dock="true">
        <div className="arg-app-toolbar">
          <span>{profile.assetId}</span>
          <span className="arg-app-count">{profile.status}</span>
        </div>

        <div className="arg-app-body arg-tool-body">
          <div className="arg-tool-grid">
            <div className="arg-tool-row">
              <span>使用人</span>
              <b>{profile.owner}</b>
            </div>
            <div className="arg-tool-row">
              <span>部门</span>
              <b>{profile.department}</b>
            </div>
            <div className="arg-tool-row">
              <span>存放地点</span>
              <b>{profile.site}</b>
            </div>
            <div className="arg-tool-row">
              <span>回收窗口</span>
              <b>{profile.window}</b>
            </div>
            <div className="arg-tool-row">
              <span>最后上报</span>
              <b>{profile.lastSeen}</b>
            </div>
          </div>

          <div className="arg-tool-section">磁盘</div>

          <div className="arg-tool-volumes">
            {profile.volumes.map((volume, index) => (
              <div
                key={index}
                className="arg-tool-volume"
                data-ok={volume.registered ? "true" : "false"}
              >
                <div className="arg-tool-volume-top">
                  <span className="arg-tool-volume-drive">{volume.drive}</span>
                  <span className="arg-tool-volume-label">{volume.label}</span>
                  <span className="arg-tool-volume-size">{volume.size}</span>
                </div>
                <div className="arg-tool-volume-meta">
                  {volume.fs} · {volume.note}
                </div>
              </div>
            ))}
          </div>

          <div className="arg-tool-note">{profile.note}</div>

          <div className="arg-tool-actions">
            <button
              type="button"
              className="arg-tool-btn"
              onClick={scan}
              disabled={scanning}
            >
              {scanning ? toolText.assetScanning : toolText.assetScan}
            </button>
            <span className="arg-tool-hint">{machine.hostname}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssetManager;
