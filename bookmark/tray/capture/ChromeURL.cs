// [Setup]
// Install Windows 10 SDK: https://developer.microsoft.com/ja-jp/windows/downloads/windows-10-sdk
// - check .NET 4.6.2 SDK
// copy UI*.dll from /cygdrive/c/Program\ Files\ \(x86\)/Reference\ Assemblies/Microsoft/Framework/.NETFramework/v4.6.2/

// [Build]
// /cygdrive/c/Windows/Microsoft.NET/Framework64/v4.0.30319/csc ChromeURL.cs
//     /r:UIAutomationClient.dll /r:UIAutomationTypes.dll

// Find UI ELement with inspect.exe 
// - inspect.exe at C:\Program Files (x86)\Windows Kits\10\bin\x64
// - open chrome and inspect.exe
// - click address bar then inspect.exe open subtree in address bar control 
//     - "Name" is NameProperty (it is localized string)
//     - "ControlType" is ControlTypeProperty
using System;
using System.Diagnostics;
using AE = System.Windows.Automation.AutomationElement;
using CT = System.Windows.Automation.ControlType;
using PC = System.Windows.Automation.PropertyCondition;
using TS = System.Windows.Automation.TreeScope;
using VP = System.Windows.Automation.ValuePattern;

class ChromeURL {
    static void Main(string[] args) {
        foreach (var proc in Process.GetProcessesByName("chrome")) {
            if (proc.MainWindowHandle == IntPtr.Zero) continue;
            var element = AE.FromHandle(proc.MainWindowHandle);
            //var cond = new PC(AE.NameProperty, "アドレス検索バー"));
            var cond = new PC(AE.ControlTypeProperty, CT.Edit);
            var edit = element.FindFirst(TS.Descendants, cond);
            if (edit == null) continue;
            var pat = edit.GetCurrentPattern(VP.Pattern) as VP;
            var url = pat.Current.Value as string;
            // the url value is just surface of edit control, e.g. "http://" is hidden
            Console.WriteLine(url);
        }
    }
}
