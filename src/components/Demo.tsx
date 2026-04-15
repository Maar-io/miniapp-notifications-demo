"use client";

import { useEffect, useCallback, useState } from "react";
import { Input } from "../components/ui/input";
import sdk, {
  AddMiniApp,
  MiniAppNotificationDetails,
  type Context,
} from "@farcaster/miniapp-sdk";
import {
  useAccount,
  useSendTransaction,
  useSignMessage,
  useSignTypedData,
  useWaitForTransactionReceipt,
  useDisconnect,
  useConnect,
  useChainId,
} from "wagmi";

import { config } from "~/components/providers/WagmiProvider";
import { Button } from "~/components/ui/Button";
import { truncateAddress } from "~/lib/truncateAddress";
import { soneium } from "wagmi/chains";
import { BaseError, UserRejectedRequestError } from "viem";
import { createStore } from "mipd";
import { Label } from "~/components/ui/label";


// Handles JSON stringify with `BigInt` values
function safeJsonStringify(obj: unknown) {
  return JSON.stringify(obj, (key, value) => {
    if (typeof value === 'bigint') {
      return value.toString();
    }
    return value;
  });
}

export default function Demo(
  { title }: { title?: string } = { title: "StartaleApp Demo" }
) {
  const [isSDKLoaded, setIsSDKLoaded] = useState(false);
  const [context, setContext] = useState<Context.MiniAppContext>();
  const [added, setAdded] = useState(false);
  const [notificationDetails, setNotificationDetails] =
    useState<MiniAppNotificationDetails | null>(null);

  const [lastEvent, setLastEvent] = useState("");

  const [addFrameResult, setAddFrameResult] = useState("");
  const [sendNotificationResult, setSendNotificationResult] = useState("");

  // StartaleApp-specific context
  const [starPoints, setStarPoints] = useState<number | null>(null);
  const [eoaWallets, setEoaWallets] = useState<string[]>([]);
  const [username, setUsername] = useState<string>("");
  const [pfpUrl, setPfpUrl] = useState<string>("");

  useEffect(() => {
    setNotificationDetails(context?.client.notificationDetails ?? null);
  }, [context]);

  const { address, isConnected } = useAccount();
  const chainId = useChainId();

  const {
    signTypedData,
    error: signTypedError,
    isError: isSignTypedError,
    isPending: isSignTypedPending,
  } = useSignTypedData();

  const { disconnect } = useDisconnect();
  const { connect } = useConnect();

  useEffect(() => {
    const load = async () => {
      const context = await sdk.context;
      setContext(context);
      setAdded(context.client.added);

      // Read StartaleApp-specific context
      const ctx = context as {
        startale?: { starPoints?: number; eoaWallets?: string[] };
        user?: { username?: string; pfpUrl?: string };
      };
      if (ctx?.startale?.starPoints !== undefined) {
        setStarPoints(ctx.startale.starPoints);
      }
      if (ctx?.startale?.eoaWallets) {
        setEoaWallets(ctx.startale.eoaWallets);
      }
      if (ctx?.user?.username) {
        setUsername(ctx.user.username);
      }
      if (ctx?.user?.pfpUrl) {
        setPfpUrl(ctx.user.pfpUrl);
      }

      sdk.on("miniAppAdded", ({ notificationDetails }) => {
        console.log("[SDK] miniAppAdded event, notificationDetails:", notificationDetails);
        setLastEvent(
          `miniAppAdded${!!notificationDetails ? ", notifications enabled" : ""}`
        );

        setAdded(true);
        if (notificationDetails) {
          console.log("[SDK] Setting notification details:", notificationDetails);
          setNotificationDetails(notificationDetails);
        }
      });

      sdk.on("miniAppAddRejected", ({ reason }) => {
        setLastEvent(`miniAppAddRejected, reason ${reason}`);
      });

      sdk.on("miniAppRemoved", () => {
        setLastEvent("miniAppRemoved");
        setAdded(false);
        setNotificationDetails(null);
      });

      sdk.on("notificationsEnabled", ({ notificationDetails }) => {
        setLastEvent("notificationsEnabled");
        setNotificationDetails(notificationDetails);
      });
      sdk.on("notificationsDisabled", () => {
        setLastEvent("notificationsDisabled");
        setNotificationDetails(null);
      });

      sdk.on("primaryButtonClicked", () => {
        console.log("primaryButtonClicked");
      });

      const ethereumProvider = await sdk.wallet.getEthereumProvider();
      ethereumProvider?.on("chainChanged", (chainId) => {
        console.log("[ethereumProvider] chainChanged", chainId)
      })
      ethereumProvider?.on("connect", (connectInfo) => {
        console.log("[ethereumProvider] connect", connectInfo);
      });

      sdk.actions.ready({});

      // Set up a MIPD Store, and request Providers.
      const store = createStore();

      // Subscribe to the MIPD Store.
      store.subscribe((providerDetails) => {
        console.log("PROVIDER DETAILS", providerDetails);
      });
    };
    if (sdk && !isSDKLoaded) {
      setIsSDKLoaded(true);
      load();
      return () => {
        sdk.removeAllListeners();
      };
    }
  }, [isSDKLoaded]);

  const openUrl = useCallback(() => {
    sdk.actions.openUrl("https://www.youtube.com/watch?v=dQw4w9WgXcQ");
  }, []);

  const close = useCallback(() => {
    sdk.actions.close();
  }, []);

  const addFrame = useCallback(async () => {
    try {
      setNotificationDetails(null);

      const result = await sdk.actions.addMiniApp();
      console.log("[addFrame] Result from sdk.actions.addMiniApp():", result);

      if (result.notificationDetails) {
        console.log("[addFrame] Got notification details:", result.notificationDetails);
        setNotificationDetails(result.notificationDetails);
      }
      setAddFrameResult(
        result.notificationDetails
          ? `Added, got notification token ${result.notificationDetails.token} and url ${result.notificationDetails.url}`
          : "Added, got no notification details"
      );
    } catch (error) {
      if (error instanceof AddMiniApp.RejectedByUser) {
        setAddFrameResult(`Not added: ${error.message}`);
      }

      if (error instanceof AddMiniApp.InvalidDomainManifest) {
        setAddFrameResult(`Not added: ${error.message}`);
      }

      setAddFrameResult(`Error: ${error}`);
    }
  }, []);

  const sendNotification = useCallback(async () => {
    setSendNotificationResult("");
    if (!notificationDetails || !context) {
      return;
    }

    try {
      const response = await fetch("/api/send-notification", {
        method: "POST",
        mode: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          notificationDetails,
        }),
      });

      if (response.status === 200) {
        setSendNotificationResult("Success");
        return;
      } else if (response.status === 429) {
        setSendNotificationResult("Rate limited");
        return;
      }

      const data = await response.text();
      setSendNotificationResult(`Error: ${data}`);
    } catch (error) {
      setSendNotificationResult(`Error: ${error}`);
    }
  }, [context, notificationDetails]);

  const signTyped = useCallback(() => {
    signTypedData({
      domain: {
        name: "StartaleApp Demo",
        version: "1",
        chainId,
      },
      types: {
        Message: [{ name: "content", type: "string" }],
      },
      message: {
        content: "Hello from StartaleApp!",
      },
      primaryType: "Message",
    });
  }, [chainId, signTypedData]);

  if (!isSDKLoaded) {
    return <div>Loading...</div>;
  }

  return (
    <div
      style={{
        paddingTop: context?.client.safeAreaInsets?.top ?? 0,
        paddingBottom: context?.client.safeAreaInsets?.bottom ?? 0,
        paddingLeft: context?.client.safeAreaInsets?.left ?? 0,
        paddingRight: context?.client.safeAreaInsets?.right ?? 0,
      }}
    >
      <div className="w-[300px] mx-auto py-2 px-2">
        <h1 className="text-2xl font-bold text-center mb-4">{title}</h1>

        <div className="mb-4">
          <h2 className="font-2xl font-bold">Context</h2>
          <div className="mt-2 bg-gray-100 dark:bg-gray-800 rounded-xl p-3">
            <table className="w-full border-collapse">
              <tbody>
                {username && (
                  <ContextRow label="Username" value={username} />
                )}
                {pfpUrl && (
                  <>
                    <ContextSeparator />
                    <ContextRow
                      label="Avatar"
                      value={
                        <img
                          src={pfpUrl}
                          alt={username || "User"}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                      }
                    />
                  </>
                )}
                {(username || pfpUrl) && <ContextSeparator />}
                <ContextRow
                  label="Star Points"
                  value={starPoints !== null ? starPoints.toLocaleString() : "—"}
                />
                <ContextSeparator />
                <ContextRow
                  label={`EOA Wallet${eoaWallets.length > 1 ? "s" : ""}`}
                  value={
                    eoaWallets.length > 0 ? (
                      <div className="flex flex-col gap-0.5">
                        {eoaWallets.map((wallet) => (
                          <span key={wallet} className="font-mono text-xs">
                            {truncateAddress(wallet)}
                          </span>
                        ))}
                      </div>
                    ) : (
                      "—"
                    )
                  }
                />
              </tbody>
            </table>
          </div>
        </div>

        <div>
          <h2 className="font-2xl font-bold">Actions</h2>

          <div className="mb-4">
            <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg my-2">
              <pre className="font-mono text-xs whitespace-pre-wrap break-words max-w-[260px] overflow-x-">
                sdk.experimental.signManifest
              </pre>
            </div>
            <SignManifest />
          </div>

          <div className="mb-4">
            <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg my-2">
              <pre className="font-mono text-xs whitespace-pre-wrap break-words max-w-[260px] overflow-x-">
                sdk.actions.openUrl
              </pre>
            </div>
            <Button onClick={openUrl}>Open Link</Button>
          </div>

          <div className="mb-4">
            <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg my-2">
              <pre className="font-mono text-xs whitespace-pre-wrap break-words max-w-[260px] overflow-x-">
                sdk.actions.close
              </pre>
            </div>
            <Button onClick={close}>Close Mini App</Button>
          </div>
        </div>

        <div className="mb-4">
          <h2 className="font-2xl font-bold">Last event</h2>

          <div className="p-4 mt-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
            <pre className="font-mono text-xs whitespace-pre-wrap break-words max-w-[260px] overflow-x-">
              {lastEvent || "none"}
            </pre>
          </div>
        </div>

        <div>
          <h2 className="font-2xl font-bold">Add to client & notifications</h2>

          <div className="mt-2 mb-4 text-sm">
            Client fid {context?.client.clientFid},
            {added ? " mini app added to client," : " mini app not added to client,"}
            {notificationDetails
              ? " notifications enabled"
              : " notifications disabled"}
          </div>

          <div className="mb-4">
            <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg my-2">
              <pre className="font-mono text-xs whitespace-pre-wrap break-words max-w-[260px] overflow-x-">
                sdk.actions.addMiniApp
              </pre>
            </div>
            {addFrameResult && (
              <div className="mb-2 text-sm">
                Add mini app result: {addFrameResult}
              </div>
            )}
            <Button onClick={addFrame} disabled={added}>
              Add mini app to client
            </Button>
          </div>

          {sendNotificationResult && (
            <div className="mb-2 text-sm">
              Send notification result: {sendNotificationResult}
            </div>
          )}
          <div className="mb-4">
            <Button onClick={sendNotification} disabled={!notificationDetails}>
              Send notification
            </Button>
          </div>
        </div>

        <div>
          <h2 className="font-2xl font-bold">Ethereum</h2>

          {address && (
            <div className="my-2 text-xs">
              Address: <pre className="inline">{truncateAddress(address)}</pre>
            </div>
          )}

          {chainId && (
            <div className="my-2 text-xs">
              Chain ID: <pre className="inline">{chainId}</pre>
            </div>
          )}

          <div className="mb-4">
            <Button
              onClick={() =>
                isConnected
                  ? disconnect()
                  : connect({ connector: config.connectors[0] })
              }
            >
              {isConnected ? "Disconnect" : "Connect"}
            </Button>
          </div>

          <div className="mb-4">
            <SignEthMessage />
          </div>

          {isConnected && (
            <>
              <div className="mb-4">
                <SendEth />
              </div>
              <div className="mb-4">
                <Button
                  onClick={signTyped}
                  disabled={!isConnected || isSignTypedPending}
                  isLoading={isSignTypedPending}
                >
                  Sign Typed Data
                </Button>
                {isSignTypedError && renderError(signTypedError)}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function ContextRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <tr>
      <td className="text-[11px] text-gray-500 dark:text-gray-400 uppercase whitespace-nowrap py-2 pr-3 align-middle">
        {label}
      </td>
      <td className="text-[13px] py-2 text-right align-middle">
        {value}
      </td>
    </tr>
  );
}

function ContextSeparator() {
  return (
    <tr>
      <td colSpan={2} className="p-0">
        <div className="h-px bg-gray-200 dark:bg-gray-700" />
      </td>
    </tr>
  );
}

function SignEthMessage() {
  const { isConnected } = useAccount();
  const { connectAsync } = useConnect();
  const {
    signMessage,
    data: signature,
    error: signError,
    isError: isSignError,
    isPending: isSignPending,
  } = useSignMessage();

  const handleSignMessage = useCallback(async () => {
    if (!isConnected) {
      await connectAsync({
        chainId: soneium.id,
        connector: config.connectors[0],
      });
    }

    signMessage({ message: "Hello from StartaleApp!" });
  }, [connectAsync, isConnected, signMessage]);

  return (
    <>
      <Button
        onClick={handleSignMessage}
        disabled={isSignPending}
        isLoading={isSignPending}
      >
        Sign Message
      </Button>
      {isSignError && renderError(signError)}
      {signature && (
        <div className="mt-2 text-xs">
          <div>Signature: {signature}</div>
        </div>
      )}
    </>
  );
}

function SendEth() {
  const { isConnected } = useAccount();
  const {
    sendTransaction,
    data,
    error: sendTxError,
    isError: isSendTxError,
    isPending: isSendTxPending,
  } = useSendTransaction();

  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({
      hash: data,
    });

  const handleSend = useCallback(() => {
    sendTransaction({
      to: "0xB3d8d7887693a9852734b4D25e9C0Bb35Ba8a830",
      value: 1n,
    });
  }, [sendTransaction]);

  return (
    <>
      <Button
        onClick={handleSend}
        disabled={!isConnected || isSendTxPending}
        isLoading={isSendTxPending}
      >
        Send Transaction (eth)
      </Button>
      {isSendTxError && renderError(sendTxError)}
      {data && (
        <div className="mt-2 text-xs">
          <div>Hash: {truncateAddress(data)}</div>
          <div>
            Status:{" "}
            {isConfirming
              ? "Confirming..."
              : isConfirmed
                ? "Confirmed!"
                : "Pending"}
          </div>
        </div>
      )}
    </>
  );
}

function SignManifest() {
  const [domain, setDomain] = useState('www.microsoft.com')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<unknown>(null)

  const handleSignManifest = async () => {
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const manifest = await sdk.experimental.signManifest({ domain })
      setResult(manifest)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <Label
          className="text-xs font-semibold text-gray-500 dark:text-gray-300 mb-1"
          htmlFor="domain-input"
        >
          Domain
        </Label>
        <Input
          id="domain-input"
          type="text"
          value={domain}
          onChange={(e) => setDomain(e.target.value)}
          className="w-full mb-2"
          placeholder="Enter domain (e.g., http://www.microsoft.com)"
        />
      </div>

      <Button
        onClick={handleSignManifest}
        disabled={loading || !domain}
        isLoading={loading}
      >
        {loading ? 'Signing...' : 'Sign Manifest'}
      </Button>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-600 font-medium">Error:</p>
          <p className="text-red-500">{error}</p>
        </div>
      )}

      {result !== null && result !== undefined && (
        <div className="p-4 bg-gray-50 border border-gray-200 rounded-md">
          <p className="font-medium mb-2">Signed Manifest:</p>
          <pre className="bg-white p-3 rounded border border-gray-300 overflow-x-auto">
            {safeJsonStringify(result)}
          </pre>
        </div>
      )}
    </div>
  )
}

const renderError = (error: Error | null) => {
  if (!error) return null;
  if (error instanceof BaseError) {
    const isUserRejection = error.walk(
      (e) => e instanceof UserRejectedRequestError
    );

    if (isUserRejection) {
      return <div className="text-red-500 text-xs mt-1">Rejected by user.</div>;
    }
  }

  return <div className="text-red-500 text-xs mt-1">{error.message}</div>;
};
